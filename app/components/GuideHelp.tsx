"use client";

import { HelpButton } from "@/app/components/HelpButton";
import DemoGuide, { getGuideStorageKey } from "@/app/components/DemoGuide";
import { DemoPage } from "@/app/components/demoGuideContent";
import { useEffect, useState } from "react";

type Props = {
  page: DemoPage; //ページの種類の型
};

export default function GuideHelp({ page }: Props) {
  const [open, setOpen] = useState(false);
  // まだ見ていなければ、最初の1回だけ自動で開く
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!sessionStorage.getItem(getGuideStorageKey(page))) setOpen(true);
  }, [page]);

  return (
    <>
      {/* 押されたら開く */}
      <HelpButton onClick={() => setOpen(true)} />
      {/* 閉じられたら閉じる */}
      <DemoGuide open={open} page={page} onClose={() => setOpen(false)} />
    </>
  );
}
