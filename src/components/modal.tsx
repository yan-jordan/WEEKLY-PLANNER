"use client";

import { useEffect, useRef } from "react";

/** Native <dialog> opened as a modal: focus trapping, Escape to close and backdrop come for free. */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className={`m-auto w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-xl ${wide ? "max-w-2xl" : "max-w-md"}`}
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id="modal-title" className="font-display text-xl font-bold">
          {title}
        </h2>
        <button onClick={onClose} className="rounded-md px-2 py-1 text-sm font-bold text-muted hover:text-ink">
          Close
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </dialog>
  );
}
