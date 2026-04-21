// Impressum page removed — returns 404 for all requests.
// The page has been removed from navigation, sitemap, and footer links.
import { notFound } from "next/navigation";

export default function ImpressumPage() {
  notFound();
}
