import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  MoreVertical,
  Pencil,
  Trash2,
  ListChecks,
  Send,
  Copy,
  BarChart3,
  ExternalLink,
} from "lucide-react";

export default function QuizActions({
  quiz,
  onDelete,
  onPublish,
  onCopyLink,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isDraft = quiz.status === "draft";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  const itemClass =
    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50";

  const runAction = (action) => {
    setOpen(false);
    action(quiz);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        aria-label={`Actions for ${quiz.title}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
      >
        <MoreVertical size={20} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link
            to={`/teacher/quizzes/${quiz._id}/questions`}
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <ListChecks size={16} />
            {isDraft
              ? "Manage Questions"
              : "View Questions"}
          </Link>

          {isDraft ? (
            <>
              <Link
                to={`/teacher/quizzes/${quiz._id}/edit`}
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <Pencil size={16} />
                Edit Quiz
              </Link>

              <button
                onClick={() => runAction(onPublish)}
                className={itemClass}
              >
                <Send size={16} />
                Publish Quiz
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => runAction(onDelete)}
                className={`${itemClass} text-red-600`}
              >
                <Trash2 size={16} />
                Delete Quiz
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => runAction(onCopyLink)}
                className={itemClass}
              >
                <Copy size={16} />
                Copy Quiz Link
              </button>

              <a
                href={`/quiz/${quiz._id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <ExternalLink size={16} />
                Open Quiz
              </a>

              <Link
                to={`/teacher/quizzes/${quiz._id}/results`}
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <BarChart3 size={16} />
                View Results
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}