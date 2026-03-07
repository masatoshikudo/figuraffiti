"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { filterSuggestions } from "@/lib/spot/spot-suggestions"

interface AutocompleteInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  required?: boolean
  icon?: string
}

export function AutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  required = false,
  icon,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverContentRef = useRef<HTMLDivElement | null>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const filteredSuggestions = filterSuggestions(suggestions, searchQuery || value, 10)

  // PopoverContentのDOM要素を取得
  useEffect(() => {
    if (open) {
      const popoverElement = document.querySelector('[data-slot="popover-content"]') as HTMLDivElement
      if (popoverElement) {
        popoverContentRef.current = popoverElement
      }
    }
  }, [open])

  // 候補がある場合に自動で開く
  useEffect(() => {
    if (filteredSuggestions.length > 0 && document.activeElement === inputRef.current) {
      setOpen(true)
    } else if (filteredSuggestions.length === 0) {
      setOpen(false)
    }
  }, [filteredSuggestions.length])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
    setSearchQuery("")
    // タイムアウトをクリア
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setSearchQuery(e.target.value)
    // 入力がある場合は候補を表示
    if (e.target.value.trim() && filteredSuggestions.length > 0) {
      setOpen(true)
    }
  }

  const handleInputFocus = () => {
    // タイムアウトをクリア
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    // フォーカス時に候補がある場合は表示
    if (filteredSuggestions.length > 0) {
      setOpen(true)
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // フォーカスがPopoverContent内に移動した場合は閉じない
    const relatedTarget = e.relatedTarget as HTMLElement
    if (popoverContentRef.current?.contains(relatedTarget)) {
      return
    }

    // 少し遅延させて、クリックイベントが発火するようにする
    blurTimeoutRef.current = setTimeout(() => {
      // フォーカスがPopoverContent内にない場合のみ閉じる
      const activeElement = document.activeElement
      if (!popoverContentRef.current?.contains(activeElement) && activeElement !== inputRef.current) {
        setOpen(false)
      }
    }, 200)
  }

  const handlePopoverMouseDown = (e: React.MouseEvent) => {
    // Popover内のマウスダウンでフォーカスが外れるのを防ぐ
    e.preventDefault()
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={label} className="text-base font-semibold">
        {icon && `${icon} `}
        {label}
        {required && " *"}
      </Label>
      <Popover open={open && filteredSuggestions.length > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full">
            <Input
              id={label}
              ref={inputRef}
              value={value}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              required={required}
              className="w-full"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-anchor-width)] p-0"
          align="start"
          onMouseDown={handlePopoverMouseDown}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="検索..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>候補が見つかりませんでした</CommandEmpty>
              <CommandGroup>
                {filteredSuggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                    onMouseDown={(e) => {
                      // マウスダウンで選択を確定
                      e.preventDefault()
                      handleSelect(suggestion)
                    }}
                    className="cursor-pointer"
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

