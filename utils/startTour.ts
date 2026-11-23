import { tourContent } from "@/app/components/tourContent";
import { DemoPage } from "@/app/components/demoGuideContent";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

//途中で表示を消すために変数の箱を作る
let activeTour: ReturnType<typeof driver> | null = null;

//操作中はtourが表示
export const startTour = (page: DemoPage, startIndex = 0) => {
  const tourContentExist = tourContent[page]; //受け取ったpageで該当のページ取り出す
  const scrollTargetId = tourContentExist?.find(
    (step) => step.scrollTargetId,
  )?.scrollTargetId;
  if (!tourContentExist) return; //もしpageが存在しない場合は、返す
  activeTour = driver({
    steps: tourContentExist,
    nextBtnText: "次へ",
    prevBtnText: "戻る",
    doneBtnText: "終了",
    overlayClickBehavior: "none",
    onDestroyed: () => {
      if (!scrollTargetId) return;
      document
        .getElementById(scrollTargetId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  });
  activeTour.drive(startIndex);
};

//提出ボタンを押すとこの関数が呼ばれハイライトの表示が消える
export const endTour = () => {
  activeTour?.destroy();
  activeTour = null;
};
