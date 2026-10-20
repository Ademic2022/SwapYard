"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "urql";

import { CameraIcon, PinIcon, XIcon } from "@/components/icons";
import { useMe } from "@/components/Providers";
import { CATEGORY_ICONS, ErrorNote } from "@/components/ui";
import type {
  Category,
  Condition,
  ListingDetailFieldsFragment,
  ListingInput,
  SkillOfferType,
} from "@/gql/graphql";
import {
  CreateListingMutation,
  GenerateListingDescriptionMutation,
  UpdateListingMutation,
  UpdateProfileMutation,
} from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { CATEGORY_LABELS, CONDITION_LABELS, OFFER_LABELS } from "@/lib/format";
import { compressImage } from "@/lib/image";

const MAX_PHOTOS = 5;

const CATEGORY_HELP: Record<Category, string> = {
  SELL: "Sell or give away something you no longer need.",
  BORROW: "Lend out a tool or item for a few days.",
  SKILL: "Offer a service for pay, a trade, or either.",
};

type PhotoSlot = { kind: "existing"; id: string; url: string } | { kind: "new"; file: File; url: string };

type FormState = {
  category: Category;
  title: string;
  description: string;
  condition: Condition | "";
  price: string;
  isFree: boolean;
  isNegotiable: boolean;
  borrowFee: string;
  borrowMaxDays: string;
  borrowDeposit: string;
  availabilityNotes: string;
  skillOfferType: SkillOfferType;
  skillRate: string;
  skillRateUnit: string;
  skillTradeFor: string;
};

function fromListing(l?: ListingDetailFieldsFragment | null): FormState {
  const n = (v?: number | null) => (v ? String(v) : "");
  return {
    category: l?.category ?? "SELL",
    title: l?.title ?? "",
    description: l?.description ?? "",
    condition: l?.condition ?? "",
    price: n(l?.priceNgn),
    isFree: l?.category === "SELL" ? l.isFree : false,
    isNegotiable: l?.isNegotiable ?? false,
    borrowFee: n(l?.borrowFeePerDayNgn),
    borrowMaxDays: l?.borrowMaxDays ? String(l.borrowMaxDays) : "3",
    borrowDeposit: n(l?.borrowDepositNgn),
    availabilityNotes: l?.availabilityNotes ?? "",
    skillOfferType: l?.skillOfferType ?? "EITHER",
    skillRate: n(l?.skillRateNgn),
    skillRateUnit: l?.skillRateUnit ?? "",
    skillTradeFor: l?.skillTradeFor ?? "",
  };
}

function amount(value: string): number | null {
  const n = parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function toInput(f: FormState): ListingInput {
  return {
    category: f.category,
    title: f.title,
    description: f.description,
    condition: f.condition || null,
    priceNgn: amount(f.price),
    isFree: f.isFree,
    isNegotiable: f.isNegotiable,
    borrowFeePerDayNgn: amount(f.borrowFee),
    borrowMaxDays: amount(f.borrowMaxDays),
    borrowDepositNgn: amount(f.borrowDeposit),
    availabilityNotes: f.availabilityNotes,
    skillOfferType: f.skillOfferType,
    skillRateNgn: amount(f.skillRate),
    skillRateUnit: f.skillRateUnit,
    skillTradeFor: f.skillTradeFor,
  };
}

export function ListingForm({ existing }: { existing?: ListingDetailFieldsFragment }) {
  const router = useRouter();
  const { me, refresh } = useMe();
  const [form, setForm] = useState<FormState>(() => fromListing(existing));
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    () => existing?.photos.map((p) => ({ kind: "existing" as const, id: p.id, url: p.url })) ?? [],
  );
  const [whatsapp, setWhatsapp] = useState("");
  const [photoError, setPhotoError] = useState<string>();
  const [processing, setProcessing] = useState(false);
  const [createState, create] = useMutation(CreateListingMutation);
  const [updateState, update] = useMutation(UpdateListingMutation);
  const [profileState, updateProfile] = useMutation(UpdateProfileMutation);
  const [describeState, describe] = useMutation(GenerateListingDescriptionMutation);

  const needsWhatsapp = !me?.whatsappNumber;
  const busy = processing || createState.fetching || updateState.fetching || profileState.fetching;
  const error = profileState.error ?? createState.error ?? updateState.error;

  // Release preview object URLs when the form goes away.
  const previewUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setPhotoError(undefined);
    setProcessing(true);
    const room = MAX_PHOTOS - photos.length;
    const added: PhotoSlot[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        const compressed = await compressImage(file);
        const url = URL.createObjectURL(compressed);
        previewUrls.current.push(url);
        added.push({ kind: "new", file: compressed, url });
      } catch (e) {
        setPhotoError((e as Error).message);
      }
    }
    if (files.length > room) setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`);
    setPhotos((current) => [...current, ...added]);
    setProcessing(false);
  }

  async function writeDescription() {
    // Whatever is already typed is sent as notes for the draft to build on.
    const result = await describe({ input: toInput(form) });
    if (result.data) set("description", result.data.generateListingDescription);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (photos.length === 0) {
      setPhotoError("Add at least one photo.");
      return;
    }
    if (needsWhatsapp) {
      const saved = await updateProfile({ input: { whatsappNumber: whatsapp } });
      if (saved.error) return;
      refresh();
    }
    const input = toInput(form);
    const newFiles = photos.flatMap((p) => (p.kind === "new" ? [p.file] : []));
    const result = existing
      ? await update({
          id: existing.id,
          input,
          keepPhotoIds: photos.flatMap((p) => (p.kind === "existing" ? [p.id] : [])),
          newPhotos: newFiles,
        })
      : await create({ input, photos: newFiles });
    const id = existing?.id ?? (result.data && "createListing" in result.data ? result.data.createListing.id : null);
    if (!result.error && id) router.push(`/l/${id}`);
  }

  const isItem = form.category !== "SKILL";
  const titlePlaceholder =
    form.category === "SKILL" ? "e.g. Logo design" : form.category === "BORROW" ? "e.g. Cordless drill" : "e.g. Standing fan";

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-6 lg:col-span-7">
        {!existing && (
          <Section step={1} title="What are you posting?">
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => {
                const Icon = CATEGORY_ICONS[c];
                const selected = form.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => set("category", c)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition sm:flex-col sm:items-start ${
                      selected
                        ? "border-leaf-700 bg-leaf-700 text-white shadow-lift"
                        : "border-ink-200 bg-ink-50 hover:border-ink-300 hover:bg-white"
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        selected ? "bg-white/15 text-sun-300" : "bg-ink-100 text-leaf-700"
                      }`}
                    >
                      <Icon />
                    </span>
                    <span>
                      <span className="block font-bold">{CATEGORY_LABELS[c]}</span>
                      <span className={`block text-xs leading-snug ${selected ? "text-leaf-100" : "text-ink-500"}`}>
                        {CATEGORY_HELP[c]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        <Section step={existing ? 1 : 2} title="Photos" aside={`${photos.length}/${MAX_PHOTOS}`}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((photo, index) => (
              <div key={photo.url} className="group relative aspect-square overflow-hidden rounded-2xl bg-ink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={`Photo ${index + 1}`} className="size-full object-cover" />
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink-900/75 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-white uppercase">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => setPhotos((ps) => ps.filter((p) => p !== photo))}
                  className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full bg-ink-900/70 text-white transition hover:bg-red-700"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 text-ink-500 transition hover:border-leaf-500 hover:bg-leaf-50 hover:text-leaf-700">
                <span className="flex flex-col items-center gap-1.5 text-xs font-semibold">
                  <CameraIcon width={24} height={24} />
                  {processing ? "Adding…" : photos.length ? "Add more" : "Add photos"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    addPhotos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          <p className="hint">Bright, clear photos get more replies. The first photo is the cover.</p>
          {photoError && <p className="mt-2 text-sm font-medium text-red-700">{photoError}</p>}
        </Section>

        <Section step={existing ? 2 : 3} title="Details">
          <div className="space-y-5">
            <label className="block">
              <span className="label">Title</span>
              <input
                required
                minLength={3}
                maxLength={80}
                className="field"
                placeholder={titlePlaceholder}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="flex items-center justify-between gap-3">
                <span className="label">Description</span>
                <button
                  type="button"
                  onClick={writeDescription}
                  disabled={describeState.fetching || form.title.trim().length < 3}
                  title={form.title.trim().length < 3 ? "Add a title first" : undefined}
                  className="mb-2 text-sm font-semibold text-leaf-700 hover:underline disabled:cursor-not-allowed disabled:text-ink-400 disabled:no-underline"
                >
                  {describeState.fetching ? "Writing…" : form.description.trim() ? "Rewrite it for me" : "Write it for me"}
                </button>
              </span>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                className="field min-h-32"
                placeholder={
                  form.category === "SKILL"
                    ? "Your experience, what's included, when you're free"
                    : "Size, brand, age, any faults"
                }
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
              {describeState.error && (
                <p className="mt-1 text-sm font-medium text-red-700">{errorMessage(describeState.error)}</p>
              )}
              <span className="hint text-right">{form.description.length}/2000</span>
            </label>

            {isItem && (
              <fieldset>
                <legend className="label">Condition</legend>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(CONDITION_LABELS) as [Condition, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={form.condition === value}
                      onClick={() => set("condition", value)}
                      className={`chip ${
                        form.condition === value
                          ? "border-leaf-700 bg-leaf-700 text-white"
                          : "border-ink-200 bg-ink-50 text-ink-700 hover:border-ink-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        </Section>

        <Section
          step={existing ? 3 : 4}
          title={form.category === "SELL" ? "Price" : form.category === "BORROW" ? "Borrowing terms" : "What you want in return"}
        >
          {form.category === "SELL" && (
            <div className="space-y-4">
              <Toggle checked={form.isFree} onChange={(v) => set("isFree", v)} label="Give it away for free" />
              {!form.isFree && (
                <>
                  <NairaInput label="Price" required value={form.price} onChange={(v) => set("price", v)} />
                  <Toggle checked={form.isNegotiable} onChange={(v) => set("isNegotiable", v)} label="Price is negotiable" />
                </>
              )}
            </div>
          )}

          {form.category === "BORROW" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <NairaInput label="Fee per day" hint="Leave empty to lend for free" value={form.borrowFee} onChange={(v) => set("borrowFee", v)} />
              <label className="block">
                <span className="label">Maximum days</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={90}
                  inputMode="numeric"
                  className="field"
                  value={form.borrowMaxDays}
                  onChange={(e) => set("borrowMaxDays", e.target.value)}
                />
              </label>
              <NairaInput label="Refundable deposit" hint="Optional" value={form.borrowDeposit} onChange={(v) => set("borrowDeposit", v)} />
              <label className="block">
                <span className="label">Availability</span>
                <input
                  maxLength={200}
                  className="field"
                  placeholder="e.g. Weekends only"
                  value={form.availabilityNotes}
                  onChange={(e) => set("availabilityNotes", e.target.value)}
                />
                <span className="hint">Optional</span>
              </label>
            </div>
          )}

          {form.category === "SKILL" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 rounded-full bg-ink-100 p-1">
                {(Object.keys(OFFER_LABELS) as SkillOfferType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={form.skillOfferType === t}
                    onClick={() => set("skillOfferType", t)}
                    className={`min-h-10 rounded-full text-sm font-semibold transition ${
                      form.skillOfferType === t ? "bg-ink-50 text-ink-900 shadow-card" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    {OFFER_LABELS[t]}
                  </button>
                ))}
              </div>
              {form.skillOfferType !== "TRADE" && (
                <div className="grid grid-cols-2 gap-4">
                  <NairaInput label="Rate" hint="Optional" value={form.skillRate} onChange={(v) => set("skillRate", v)} />
                  <label className="block">
                    <span className="label">Per</span>
                    <input
                      maxLength={30}
                      className="field"
                      placeholder="hour, session…"
                      value={form.skillRateUnit}
                      onChange={(e) => set("skillRateUnit", e.target.value)}
                    />
                  </label>
                </div>
              )}
              {form.skillOfferType !== "PAID" && (
                <label className="block">
                  <span className="label">Will trade for</span>
                  <input
                    maxLength={200}
                    className="field"
                    placeholder="e.g. Haircut, French lessons"
                    value={form.skillTradeFor}
                    onChange={(e) => set("skillTradeFor", e.target.value)}
                  />
                </label>
              )}
            </div>
          )}
        </Section>

        {needsWhatsapp && (
          <Section step={existing ? 4 : 5} title="How neighbors reach you">
            <label className="block">
              <span className="label">WhatsApp number</span>
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="field"
                placeholder="+234 803 123 4567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <span className="hint">
                Neighbors tap &ldquo;Chat on WhatsApp&rdquo; to message you. Your number is never shown on the site.
              </span>
            </label>
          </Section>
        )}
      </div>

      <aside className="lg:col-span-5">
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="hidden lg:block">
            <p className="eyebrow mb-3">Preview</p>
            <Preview form={form} photo={photos[0]?.url} />
          </div>
          {me?.place && (
            <p className="flex items-center gap-2 text-sm text-ink-500">
              <PinIcon className="size-4 shrink-0 text-leaf-600" />
              <span>
                Shown to neighbors around <strong className="text-ink-900">{me.place.label}</strong>.{" "}
                <Link href="/me" className="font-semibold text-leaf-700 hover:underline">
                  Change
                </Link>
              </span>
            </p>
          )}
          <ErrorNote>{errorMessage(error)}</ErrorNote>
          <button type="submit" className="btn-primary min-h-13 w-full text-base" disabled={busy}>
            {busy ? "Saving…" : existing ? "Save changes" : "Publish listing"}
          </button>
          <p className="text-center text-xs leading-relaxed text-ink-500">
            Listings stay up for 30 days. No weapons, drugs, alcohol, medicines, counterfeits, animals or adult content.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Section({
  step,
  title,
  aside,
  children,
}: {
  step: number;
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-800">{step}</span>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {aside && <span className="ml-auto text-sm font-semibold text-ink-500">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-2">
      <span className="text-sm font-semibold">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 rounded-full bg-ink-300 transition peer-checked:bg-leaf-600 peer-focus-visible:ring-4 peer-focus-visible:ring-leaf-100 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
      />
    </label>
  );
}

function previewPrice(f: FormState): string {
  const n = amount(f.price);
  if (f.category === "SELL") return f.isFree ? "Free" : n ? `₦${n.toLocaleString("en-NG")}` : "Set a price";
  if (f.category === "BORROW") {
    const fee = amount(f.borrowFee);
    return fee ? `₦${fee.toLocaleString("en-NG")}/day` : "Free to borrow";
  }
  const rate = amount(f.skillRate);
  if (f.skillOfferType === "TRADE") return "Trade";
  return rate ? `₦${rate.toLocaleString("en-NG")} ${f.skillRateUnit}`.trim() : OFFER_LABELS[f.skillOfferType];
}

function Preview({ form, photo }: { form: FormState; photo?: string }) {
  return (
    <div className="w-64">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-ink-100 shadow-lift">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-ink-400">
            <CameraIcon width={32} height={32} />
          </div>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-ink-50/95 px-3 py-1 text-sm font-bold">{previewPrice(form)}</span>
      </div>
      <p className="mt-3 line-clamp-2 px-1 font-semibold">{form.title || "Your listing title"}</p>
      <p className="px-1 text-xs font-medium text-ink-500">{CATEGORY_LABELS[form.category]}</p>
    </div>
  );
}

function NairaInput({
  label,
  hint,
  value,
  onChange,
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-semibold text-ink-500">₦</span>
        <input
          required={required}
          inputMode="numeric"
          className="field pl-8"
          value={value ? Number(value).toLocaleString("en-NG") : ""}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 9))}
        />
      </span>
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}
