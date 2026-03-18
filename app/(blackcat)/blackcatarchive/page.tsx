/**
 * app/(blackcat)/blackcatarchive/page.tsx
 *
 * THIS IS WHERE THE INTRO GETS WIRED IN.
 * The BlackCatIntro component wraps all page content.
 * On first visit this session: film leader → enter button → video → site.
 * On subsequent visits: goes straight to the site content.
 */
import { BlackCatIntro } from "@/app/components/blackcat/BlackCatIntro";
import {BlackCatHomeContent} from "../../components/blackcat/BlackCatHomeContent";


export const metadata = {
  title: "BLACK CAT ARCHIVE",
};

export default function BlackCatArchivePage() {
  return (
    <BlackCatIntro introVideoSrc="/blackcat-intro.mp4">
      <BlackCatHomeContent />
    </BlackCatIntro>
  );
}