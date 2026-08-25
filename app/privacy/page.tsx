import { Box, Container, Typography, Divider } from "@mui/material";

export const metadata = {
  title: "プライバシーポリシー | Tsunagu",
};

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4">プライバシーポリシー</Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1">
          運営者: Nakahara Yasuhiro（個人開発）
        </Typography>
        <Typography variant="body1">
          お問い合わせ先: tsunagu.app.support@gmail.com
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Section title="取得する情報">
        本サービスでは、教師・保護者いずれも、Googleの認証（OAuth）を通じて
        以下の権限の許可を求める場合があります。
        <br />
        <br />
        ・Gmailでメールを送信する権限（教師が保護者への通知メールを送信するために使用）
        <br />
        ・Googleカレンダーに予定を作成・更新する権限（保護者が面談予定を自分のカレンダーに登録するために使用）
        <br />
        <br />
        上記の許可を得た場合、アクセストークンおよびリフレッシュトークンを本サービスのデータベースに保存します。
      </Section>

      <Section title="利用目的">
        取得した情報は、以下の目的にのみ使用します。
        <br />
        <br />
        ・面談日程に関する通知メールの送信
        <br />
        ・保護者のGoogleカレンダーへの面談予定の登録
      </Section>

      <Section title="第三者提供について">
        本サービスが取得した情報を、本人の同意なく第三者に提供することはありません。
      </Section>

      <Section title="データの保存・削除">
        取得した情報は、本サービス提供の目的の範囲内でのみ保存します。
        アカウントを削除された場合、Google連携に関する情報（アクセストークン・
        リフレッシュトークンを含む）も同時に削除されます。
        その他、情報の削除についてご要望がある場合は、上記の問い合わせ先までご連絡ください。
      </Section>

      <Section title="改定について">
        本ポリシーは、予告なく変更されることがあります。
        本ポリシーに関するお問い合わせは、下記までご連絡ください。
        <br />
        <br />
        お問い合わせ先: tsunagu.app.support@gmail.com
        <br />
        制定日: 2026年8月
      </Section>
    </Container>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
        {children}
      </Typography>
    </Box>
  );
}
