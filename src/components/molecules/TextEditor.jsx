import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { cn } from "@/utils/cn"

const TextEditor = ({ value = "", onChange, placeholder = "Enter text..." }) => {
  const [isPreview, setIsPreview] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  const insertFormat = (before, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>')
      .replace(/^#{3}\s+(.*)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^#{2}\s+(.*)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^#{1}\s+(.*)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^-\s+(.*)/gm, '<li class="ml-4">• $1</li>')
      .replace(/\n/g, '<br />')
  }

  const toolbarButtons = [
    { icon: "Bold", action: () => insertFormat("**", "**"), title: "Bold" },
    { icon: "Italic", action: () => insertFormat("*", "*"), title: "Italic" },
    { icon: "Code", action: () => insertFormat("`", "`"), title: "Code" },
    { icon: "Heading1", action: () => insertFormat("# "), title: "Heading 1" },
    { icon: "Heading2", action: () => insertFormat("## "), title: "Heading 2" },
    { icon: "Heading3", action: () => insertFormat("### "), title: "Heading 3" },
    { icon: "List", action: () => insertFormat("- "), title: "Bullet List" }
  ]

  return (
    <div className={cn(
      "border rounded-lg transition-colors",
      isFocused ? "border-primary-500 ring-1 ring-primary-500" : "border-gray-300 dark:border-gray-600"
    )}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-600 p-2 flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-t-lg">
        <div className="flex items-center gap-1">
          {toolbarButtons.map(button => (
            <Button
              key={button.icon}
              type="button"
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.title}
              className="h-8 w-8 p-0"
            >
              <ApperIcon name={button.icon} size={16} />
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className={cn(
              "text-xs px-2 h-8",
              isPreview && "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100"
            )}
          >
            <ApperIcon name={isPreview ? "Edit" : "Eye"} size={14} className="mr-1" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {isPreview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[120px] p-4 prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: value ? formatMarkdown(value) : '<p class="text-gray-400">Nothing to preview...</p>'
            }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={cn(
                "w-full min-h-[120px] p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                "resize-y border-0 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500",
                "rounded-b-lg"
              )}
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' }}
            />

            {/* Character Count */}
            {value && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-1">
                {value.length} characters
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Help Text */}
      <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <strong>**bold**</strong>
          </span>
          <span className="flex items-center gap-1">
            <em>*italic*</em>
          </span>
          <span className="flex items-center gap-1">
            <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">`code`</code>
          </span>
          <span className="flex items-center gap-1">
            # heading
          </span>
          <span className="flex items-center gap-1">
            - list
          </span>
        </div>
      </div>
    </div>
  )
}

export default TextEditor