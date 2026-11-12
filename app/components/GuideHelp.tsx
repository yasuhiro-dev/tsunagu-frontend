"use client";

import { HelpButton } from "@/app/components/HelpButton";
import DemoGuide, { getGuideStorageKey } from "@/app/components/DemoGuide";
import { DemoPage } from "@/app/components/demoGuideContent";
import { useEffect, useState } from "react";
import { useDemoMode } from "@/utils/useDemoMode";
import { Child } from "@/app/components/DemoGuide";

type Props = {
  page: DemoPage; //ページの種類の型
  className?: string | null;
  childName?: Child[];
  classLength?: number;
  parentLength?: number;
};

export default function GuideHelp({
  page,
  className,
  childName,
  classLength,
  parentLength,
}: Props) {
  const [open, setOpen] = useState(false);
  const demoMode = useDemoMode();
  // まだ見ていなければ、最初の1回だけ自動で開く
  useEffect(() => {
    if (demoMode !== "guided") return;
    if (!sessionStorage.getItem(getGuideStorageKey(page)))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
  }, [page, demoMode]);

  return (
    <>
      {/* 押されたら開く */}
      <HelpButton onClick={() => setOpen(true)} />
      {/* 閉じられたら閉じる */}
      <DemoGuide
        open={open}
        className={className}
        page={page}
        onClose={() => setOpen(false)}
        childName={childName}
        classLength={classLength}
        parentLength={parentLength}
      />
    </>
  );
}
