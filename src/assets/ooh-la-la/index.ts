import family from "./chicken-family.png.asset.json";
import grin from "./grin-reaper.jpeg.asset.json";
import ooh from "./ooh-la-la.png.asset.json";
import human from "./human-ooh-la-la.jpeg.asset.json";
import disco from "./disco-cluck.jpg";
import fluff from "./sir-fluffington.jpg";
import space from "./eggstronaut.jpg";

export const OOH_LA_LA_IMAGES: Record<number, string> = {
  29: family.url, 30: grin.url, 31: ooh.url, 32: human.url,
  33: disco, 34: fluff, 35: space,
};