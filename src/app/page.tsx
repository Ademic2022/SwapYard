import { Feed } from "@/components/feed/Feed";

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Listings near you</h1>
      <Feed />
    </>
  );
}
