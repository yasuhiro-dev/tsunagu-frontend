"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

export const DemoMovieButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<PlayCircleIcon />}
        onClick={() => setIsOpen(true)}
        sx={{
          color: "primary.dark",
          borderColor: "primary.dark",
          fontWeight: "bold",
        }}
      >
        動画で全体の流れを見る（1分30秒）
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {" "}
        <video
          src="/videos/demo-movie.mp4"
          poster="/videos/demo-movie-poster.png"
          controls
          autoPlay
          playsInline
          preload="none"
          style={{ width: "100%", display: "block" }}
        />
      </Dialog>
    </>
  );
};
