"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import FlowStepper from "@/app/components/FlowStepper";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";

// 未連携教師オブジェクトの型
type UnLinkedTeacher = {
  teacher_name: string;
  class_room: string | null;
};

// 未連携ユーザーオブジェクトの型
type UnLinkedUser = {
  child_name: string;
  class_name: string;
  parent_name: string;
  teacher_name: string;
};

export default function AssignmentNotification() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [notifiedCount, setNotifiedCount] = useState(0);
  const [unNotified, setUnNotified] = useState(0);
  const [allUserCount, setAllUserCount] = useState(0);
  const [unLinkedTeacher, setUnLinkedTeacher] = useState<UnLinkedTeacher[]>([]);
  const [unLinkedUser, setUnLinkedUser] = useState<UnLinkedUser[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [requested, setRequested] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  //未送信ユーザの詳細から数だけを取り出す
  const unNotifiedCount = unLinkedUser.length;
  //ページネーション（全部で何ページあるか）
  const totalPages = useMemo(() => {
    return Math.ceil(unNotifiedCount / itemsPerPage); //未送信保護者/1ページに表示される数
  }, [unNotifiedCount, itemsPerPage]);
  //ページネーション（１ページに表示するもの）
  const pagedNotifiedParent = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return unLinkedUser.slice(start, end);
  }, [unLinkedUser, itemsPerPage, currentPage]);

  // メール送信ボタンを押した時、assignment_notificationsにAPIを送る
  const handleClick = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignment_notifications`,
      {
        method: "POST",
      },
    );
    const data = await res.json();
    if (data.status === "started") {
      let pollCount = 0; //何回行ったら止める処理を設定
      const timerId = setInterval(async () => {
        const latestCount = await fetchNotificationStatus(); //最新の情報をfetchNotificationStatusから呼ぶ
        pollCount = pollCount + 1; //関数を読んだら１回カウントされる

        if (latestCount === 0 || pollCount > 20) {
          clearInterval(timerId);
        }
      }, 3000);
      setRequested(true);
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("メール送信を開始しました");
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("未送信ユーザーが存在しないので送信できましせん");
    }
  };

  //未連携教師・未送信件数の情報を取得するため、assignment_notificationsにAPIを送る
  const fetchNotificationStatus = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignment_notifications`,
      {
        method: "GET",
      },
    );

    const data = await res.json();
    setNotifiedCount(data.notified_count ?? 0); //通知済
    setUnNotified(data.unnotified_count ?? 0); //未送信
    setUnLinkedTeacher(data.unlinked_teachers ?? []); //未連携教師
    setAllUserCount(data.all_user_count ?? 0); //全ユーザーの数
    setUnLinkedUser(data.unnotified_details ?? []); //未送信ユーザー詳細

    return data.unnotified_count; //関数のfetchNotificationStatusが未送信件数の最新版を受け取れる
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchNotificationStatus();
  }, []);

  const isDone = unNotified === 0 && allUserCount > 0; //割り当て後、未通知が０
  const unAvailable = allUserCount === 0; //割り当て前
  const unLinkedTeacherCount = unLinkedTeacher.length;

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        maxWidth: isMobile ? "265px" : "100",
        backgroundColor: "#ecf1f4ff",
      }}
    >
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
            <Typography variant="h6">保護者への通知</Typography>
            <Typography>
              確定した面談日程を、保護者へメールでお知らせします。
              面談表を調整した後に、内容を確認してから送信してください
            </Typography>
          </Box>
          {/* 割り当ての手順 */}
          <Box
            sx={{
              flex: 2,
              minWidth: 0,
              backgroundColor: "#ecf1f4ff",
              p: 2,
              borderRadius: 3,
            }}
          >
            <FlowStepper activeStep={3} />
          </Box>
        </Paper>
        <Paper sx={{ display: "flex", p: 2 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: "column",
              p: 2,
              mr: 2,
              flex: 2,
            }}
          >
            <Typography variant="h6">
              未送信保護者にメールを送信します。
            </Typography>
            <Typography>
              面談日程は確定していますが、{unNotified}
              件の保護者にはまだメールが届いていません。
            </Typography>
            <Typography>
              面談日程はマイページで確認できますが、メール通知はまだ届いていません。
            </Typography>
          </Box>

          {/* ボタン操作群 */}
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              minHeight: 100,
            }}
          >
            {/*割り当て完了ボタン */}
            <Button
              variant="contained"
              fullWidth
              color="primary"
              onClick={handleClick}
              disabled={requested || isDone || unAvailable} //送信済みまたは未送信ユーザーが０の時にボタン操作できない
              sx={{
                height: 50,
              }}
            >
              {isDone
                ? "全て送信済みです"
                : requested
                  ? "送信を開始しました"
                  : unAvailable
                    ? "割り当て後に送信できます"
                    : "▶ 送信を開始する"}
            </Button>
            {!unAvailable && (
              <Typography>すでに送信した保護者には再送されません。</Typography>
            )}
          </Box>
        </Paper>

        <Paper sx={{ display: "flex", flexDirection: "column", p: 2, gap: 2 }}>
          <Typography variant="h5">メール通知の状況</Typography>
          <Box sx={{ display: "flex" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                maxHeight: 300,
              }}
            >
              <Box sx={{ display: "flex", p: 2, gap: 2 }}>
                <Paper
                  sx={{
                    minWidth: 150,
                    backgroundColor: "#fbebec",
                    display: "flex",
                    flexDirection: "column", // ラベルと数字を縦に並べる
                    alignItems: "center", // 横方向の中央
                    justifyContent: "center", // 縦方向の中央
                    textAlign: "center",
                    gap: 2,
                    p: 2,
                  }}
                >
                  <Typography>未送信</Typography>
                  <Typography variant="h6">{unNotified}件</Typography>
                </Paper>
                <Paper
                  sx={{
                    minWidth: 150,
                    backgroundColor: "#e8f5ee",
                    display: "flex",
                    flexDirection: "column", // ラベルと数字を縦に並べる
                    alignItems: "center", // 横方向の中央
                    justifyContent: "center", // 縦方向の中央
                    textAlign: "center",
                    gap: 2,
                    p: 2,
                  }}
                >
                  <Typography>送信済み</Typography>
                  <Typography variant="h6">{notifiedCount}件</Typography>
                </Paper>
                <Paper
                  sx={{
                    backgroundColor: "#d6e4f0",
                    display: "flex",
                    minWidth: 150,
                    flexDirection: "column", // ラベルと数字を縦に並べる
                    alignItems: "center", // 横方向の中央
                    justifyContent: "center", // 縦方向の中央
                    textAlign: "center",
                    gap: 2,
                    p: 2,
                  }}
                >
                  <Typography>送信対象</Typography>
                  <Typography variant="h6">{allUserCount}件</Typography>
                </Paper>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 150 }}
              >
                特別支援学級の面談を含むため、児童数より多くなる場合があります。
              </Typography>
            </Box>

            <Paper
              sx={{
                backgroundColor: "#e2dcd1ff",
                display: "flex",
                flexDirection: "column",
                p: 2,
                gap: 2,
                maxHeight: 300,
                flex: 1,
              }}
            >
              <Typography>
                Google未連携の教師 {unLinkedTeacherCount}名
              </Typography>

              <Typography>
                この教師が担当する家庭にはメールが送信できません。
                <br /> 該当の教師にGoogle連携を依頼してください
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  backgroundColor: "white",
                  p: 2,
                }}
              >
                {unLinkedTeacherCount === 0 ? (
                  <Typography sx={{ color: "success.main" }}>
                    ✓ すべての教師がGoogle連携済みです。このまま送信できます。
                  </Typography>
                ) : (
                  unLinkedTeacher.map((teacher, index) => (
                    <Box key={index} sx={{ display: "flex", mb: 2 }}>
                      <Typography sx={{ flex: 1 }}>
                        {teacher.class_room}
                      </Typography>
                      <Typography sx={{ flex: 1 }}>
                        {teacher.teacher_name}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Box>
        </Paper>

        <Paper sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            未送信の保護者{" "}
            <Chip
              sx={{ backgroundColor: "#fbebec" }}
              label={`${unNotified}件`}
            />
          </Typography>
          <TableContainer
            sx={{
              maxHeight: "calc(100vh - 400px)",
              overflow: "auto",
              // maxWidth: isMobile ? "265px" : "100",
            }}
          >
            <Table sx={{ tableLayout: "fixed" }}>
              {/* ヘッダーカラム */}
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "primary.dark",
                    "& th": { color: "white" },
                  }}
                >
                  <TableCell sx={{ width: "25%" }}>保護者名</TableCell>
                  <TableCell sx={{ width: "25%" }}>学年・組</TableCell>
                  <TableCell sx={{ width: "25%" }}>児童名</TableCell>
                  <TableCell sx={{ width: "25%" }}>担当教師</TableCell>
                </TableRow>
              </TableHead>
              {/* ボディーカラム */}

              <TableBody>
                {allUserCount === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      まだ面談が割り当てられていません。割り当て後に通知できます。
                    </TableCell>
                  </TableRow>
                ) : unNotified === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      未送信の保護者はいません。すべて送信済みです。
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedNotifiedParent.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.parent_name}</TableCell>
                      <TableCell>{user.class_name}</TableCell>
                      <TableCell>{user.child_name}</TableCell>
                      <TableCell>{user.teacher_name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={totalPages} // 全部で何ページあるか
            page={currentPage} // 今何ページ目か
            onChange={(e, page) => setCurrentPage(page)} // ページを切り替えたとき
          />
        </Paper>
      </Box>
    </Paper>
  );
}
