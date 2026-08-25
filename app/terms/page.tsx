import { Box, Container, Typography, Divider } from "@mui/material";

export const metadata = {
  title: "利用規約 | Tsunagu",
};

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4">利用規約</Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1">
          運営者: Nakahara Yasuhiro（個人開発）
        </Typography>
        <Typography variant="body1">
          お問い合わせ先: tsunagu.app.support@gmail.com
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Section title="第1条（適用）">
        本規約は、Tsunagu（以下「本サービス」）の利用に関し、
        利用者と運営者Nakahara Yasuhiro（以下「運営者」）との間の
        権利義務関係を定めるものです。利用者は、本サービスを利用することにより、
        本規約に同意したものとみなします。
      </Section>

      <Section title="第2条（利用登録）">
        利用者は、本サービスが定める方法により利用登録を行うものとします。
        登録内容に虚偽、誤記、または記入漏れがあった場合、
        運営者は利用者の登録を拒否、または登録後であっても取り消すことができるものとします。
      </Section>

      <Section title="第3条（禁止事項）">
        利用者は、本サービスの利用にあたり、以下の行為をしてはならないものとします。
        <br />
        <br />
        ・法令または公序良俗に違反する行為
        <br />
        ・犯罪行為に関連する行為
        <br />
        ・運営者、他の利用者、またはその他第三者の権利・利益を侵害する行為
        <br />
        ・本サービスのサーバーやネットワークの機能を破壊・妨害する行為
        <br />
        ・不正アクセスをし、またはこれを試みる行為
        <br />
        ・他の利用者に成りすます行為
        <br />
        ・自身が正当な権限を持たない児童・保護者・面談等の情報にアクセスし、
        またはこれを外部に開示する行為
        <br />
        ・本サービスを通じて取得した個人情報を、本来の目的（面談日程調整等）
        以外の目的で利用する行為
        <br />
        ・その他、運営者が不適切と判断する行為
      </Section>

      <Section title="第4条（サービスの提供の停止等）">
        運営者は、以下のいずれかに該当する場合、利用者に事前に通知することなく
        本サービスの全部または一部の提供を停止または中断することができるものとします。
        <br />
        <br />
        ・本サービスにかかるシステムの保守点検または更新を行う場合
        <br />
        ・地震、落雷、火災、停電または天災などの不可抗力により、
        本サービスの提供が困難となった場合
        <br />
        ・その他、運営者が本サービスの提供が困難と判断した場合
        <br />
        <br />
        運営者は、本サービスの提供の停止または中断により、
        利用者または第三者が被った不利益または損害について、
        一切の責任を負わないものとします。
      </Section>

      <Section title="第5条（免責事項）">
        本サービスは、個人開発によるポートフォリオ作品として提供されており、
        実際の学校現場での本番運用を目的としたものではありません。
        <br />
        <br />
        運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、
        完全性、有効性、特定の目的への適合性、バグまたはエラー、権利侵害等を含みます）
        がないことを明示的にも黙示的にも保証しません。
        <br />
        <br />
        運営者は、本サービスに起因して利用者に生じたあらゆる損害について、
        一切の責任を負わないものとします。
      </Section>

      <Section title="第6条（規約の変更）">
        運営者は、必要と判断した場合には、利用者に通知することなく
        いつでも本規約を変更できるものとします。
      </Section>

      <Section title="第7条（準拠法・裁判管轄）">
        本規約の解釈にあたっては、日本法を準拠法とします。
        本サービスに関して紛争が生じた場合には、
        運営者の所在地を管轄する裁判所を専属的合意管轄とします。
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
