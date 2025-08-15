"use client";
import { Fragment, useRef, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 transition-opacity" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-start justify-center p-4 sm:p-8">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="translate-y-8 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="ease-in duration-150"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="translate-y-8 opacity-0"
          >
            <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center">
              <div className="w-full flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-eym-accent-orange transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar productos, categorías..."
                  className="flex-1 bg-transparent outline-none border-none text-eym-dark placeholder-gray-400 text-lg font-sans"
                />
                <button className="text-eym-accent-orange hover:text-eym-dark transition-colors" tabIndex={-1} aria-label="Buscar">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
              {/* Aquí se pueden mostrar sugerencias o resultados en el futuro */}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 