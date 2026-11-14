"use client";

import {
  DemoPage,
  demoPageContent,
  freeGuideContent,
} from "./demoGuideContent";
import { useState, useEffect } from "react";
import { getRole, getName } from "@/utils/auth";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import NextStepButton from "@/app/components/NextStepButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDemoMode } from "@/utils/useDemoMode";
import { startTour } from "@/utils/startTour";
import Image from "next/image";

export type Child = {
  name: string;
  classroom: string;
};

//画像を先に読み込み
const DEMO_IMAGES = {
  teacher: "/images/demo-login-dialog/teacher.webp",
  parent: "/images/demo-login-dialog/parent.webp",
  admin: "/images/demo-login-dialog/admin.webp",
  girl: "/images/demo-login-dialog/child-girl.webp",
  boy: "/images/demo-login-dialog/child-boy.webp",
  school: "/images/demo-login-dialog/school.webp",
};

// 親コンポーネントからpageを受け取る時の型指定
type Props = {
  page: DemoPage;
  open: boolean;
  onClose: () => void;
  className?: string | null;
  childName?: Child[];
  classLength?: number;
  parentLength?: number;
};
// sessionStorage に「案内を見た」と記録するときのキー名を作る（GuideHelpでも同じ形で使うから定義した）
export const getGuideStorageKey = (page: DemoPage) => `demo-guide-seen:${page}`;

// 親から page を受け取る
export default function DemoGuide({
  page,
  open,
  onClose,
  className,
  childName,
  classLength,
  parentLength,
}: Props) {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState<string | null>(null);
  // 受け取った pageで、文言を取り出して content に入れる
  //ゲストログインようの案内ガイドを表示にする
  const demoMode = useDemoMode();

  //ゲストログインかでも体験でのログインかで案内表示の内容を変更
  const content =
    (demoMode === "free" && freeGuideContent[page]) || demoPageContent[page];

  const handleClose = () => {
    // sessionStorage に「案内を見た」と記録するときのキー名（pageごとに記録される）
    const storageKey = `demo-guide-seen:${page}`;
    sessionStorage.setItem(storageKey, "1");
    onClose();
  };

  //「始める」を押した後の処理
  const handleStartTour = () => {
    handleClose();
    startTour(page);
  };

  useEffect(() => {
    // localStorageはクライアントでしか読めないため、マウント後に同期する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setRole(getRole());
    setName(getName());
    Object.values(DEMO_IMAGES).forEach((src) => {
      const img = new window.Image(); //画像を事前に読み込む箱を用意
      img.src = src;
    });
  }, []);

  return (
    <Dialog sx={{ p: 1 }} onClose={handleClose} open={open}>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",

            gap: 1,
          }}
        >
          <DialogTitle
            variant="h5"
            sx={{
              p: 0,
              backgroundColor: content.backgroundColor,
              borderRadius: 3,
              alignSelf: "flex-start",
              px: 1.5,
            }}
          >
            {content.title}
          </DialogTitle>
          <Typography variant="h6">{content.heading}</Typography>
        </Box>
        {mounted && content.showIdentity === true && (
          <Box>
            {role === "teacher" && (
              <Box
                sx={{
                  borderRadius: 2,
                  display: "flex",
                  backgroundColor: "#e3ecf7",
                  p: 1,
                  gap: 3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flex: 3, display: "flex" }}>
                  <Image
                    src={DEMO_IMAGES.teacher}
                    alt="担任アイコン"
                    width={100}
                    height={91}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 2,
                      gap: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={content.chip}
                      size="small"
                      sx={{
                        fontSize: 14,
                        fontWeight: "bold",
                        maxWidth: 180,
                        backgroundColor: content.color,
                        color: "common.white",
                      }}
                    />
                    <Typography variant="h5">{name} 先生</Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    backgroundColor: "#ffff",
                    p: 1,
                    flex: 1,
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "primary.main", fontWeight: "bold" }}
                  >
                    担当学級
                  </Typography>
                  <Typography variant="h6">{className}</Typography>
                </Box>
              </Box>
            )}
            {role === "parent" && (
              <Box
                sx={{
                  borderRadius: 2,
                  display: "flex",
                  backgroundColor: content.backgroundColor,
                  p: 1,
                  gap: 3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex" }}>
                  <Image
                    src={DEMO_IMAGES.parent}
                    alt="保護者アイコン"
                    width={100}
                    height={91}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",

                      gap: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={content.chip}
                      size="small"
                      sx={{
                        fontSize: 14,
                        fontWeight: "bold",
                        maxWidth: 180,
                        backgroundColor: content.color,
                        color: "common.white",
                      }}
                    />
                    <Typography variant="h5">{name} 様</Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    backgroundColor: "#ffff",
                    p: 1,

                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "primary.main",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    お子様 (2人)
                  </Typography>
                  <>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {childName?.map((c, index) => {
                        const childImages = [DEMO_IMAGES.girl, DEMO_IMAGES.boy];
                        return (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              src={childImages[index % childImages.length]}
                              alt=""
                              width={48}
                              height={48}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {c.name} さん ({c.classroom})
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                </Box>
              </Box>
            )}
            {role === "admin" && (
              <Box
                sx={{
                  borderRadius: 2,
                  display: "flex",
                  backgroundColor: content.backgroundColor,
                  p: 1,
                  gap: 3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex" }}>
                  <Image
                    src={DEMO_IMAGES.admin}
                    alt="教頭アイコン"
                    width={100}
                    height={91}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={content.chip}
                      size="small"
                      sx={{
                        fontSize: 14,
                        fontWeight: "bold",
                        maxWidth: 180,
                        backgroundColor: content.color,
                        color: "common.white",
                      }}
                    />
                    <Typography variant="h5">教頭先生</Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: "#ffff",
                      p: 1,
                      borderRadius: 2,
                      ml: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        fontWeight: "bold",
                      }}
                    >
                      担当範囲
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Image
                        src={DEMO_IMAGES.school}
                        alt="学校アイコン"
                        width={60}
                        height={60}
                      />
                      <Typography variant="h5">学校全体</Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        fontSize: 14,
                        alignItems: "center",
                      }}
                    >
                      全
                      <Typography variant="h6" sx={{ color: "primary.main" }}>
                        {classLength}
                      </Typography>
                      クラス・
                      <Typography variant="h6" sx={{ color: "primary.main" }}>
                        {parentLength}
                      </Typography>
                      家庭
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
        {content.purpose && (
          <Typography sx={{ whiteSpace: "pre-line" }}>
            {content.purpose}
          </Typography>
        )}

        {content.steps && content.steps.length > 0 && (
          <Box
            sx={{
              bgcolor: "grey.200",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Chip
              label="やること"
              sx={{
                backgroundColor: content.color,
                color: "#ffff",
                fontWeight: "bold",
                mb: 1,
              }}
            />
            {content.steps?.map((step, index) => (
              <Typography sx={{ mb: 1 }} key={index}>
                {step}
              </Typography>
            ))}
          </Box>
        )}

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {content.note}
        </Typography>
      </DialogContent>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {content.buttonCancel && (
          <DialogActions>
            <Button
              variant="outlined"
              sx={{ p: 1, fontSize: 14 }}
              onClick={handleClose}
            >
              {content.buttonCancel}
            </Button>
          </DialogActions>
        )}

        <DialogActions>
          {/* もしURL先がある場合、NextStepButtonが処理 */}
          {content.buttonUrl ? (
            <NextStepButton page={page} />
          ) : (
            // URL先がない場合は閉じるだけ
            <Button
              variant="contained"
              color="success"
              sx={{ p: 1, fontWeight: "bold", fontSize: 14 }}
              endIcon={<ArrowForwardIcon />}
              onClick={handleStartTour}
            >
              {content.buttonLabel}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
