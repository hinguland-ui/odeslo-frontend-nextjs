import { FullScreenLoader } from "@/components/ui/Preloader";

/** Shown while the first screen of the app loads. */
export default function Loading() {
  return <FullScreenLoader variant="orbit" label="Loading Odeslo" />;
}
