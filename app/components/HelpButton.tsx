import HelpIcon from "@mui/icons-material/Help";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

type Props = {
  onClick?: () => void;
};
//guideHelp（親）からonClick関数を受け取る（押されたら何をするかは親で決める）
export function HelpButton({ onClick }: Props) {
  return (
    <Tooltip title="操作ガイドを見る">
      {/* 押されたらonClockの処理がされる */}
      <IconButton size="small" onClick={onClick}>
        <HelpIcon color="primary" />
      </IconButton>
    </Tooltip>
  );
}
