'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
  modalContent: ReactNode | null
  setModalContent: (content: ReactNode) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

interface ModalProviderProps {
  children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState<ReactNode | null>(null)

  const openModal = () => setIsOpen(true)
  const closeModal = () => {
    setIsOpen(false)
    setModalContent(null)
  }

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        modalContent,
        setModalContent,
      }}
    >
      {children}
      {/* 模態框渲染 */}
      {isOpen && modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          {/* 模態框內容 */}
          <div className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-auto">
            {modalContent}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}