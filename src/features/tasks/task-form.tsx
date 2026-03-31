import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { PositionOption, ResolutionType } from '@/lib/task-model'
import { resolutionLabels, RESOLUTION_VALUES } from '@/lib/task-model'
import type { TaskFormValues } from '@/features/tasks/use-task-data'

type TaskFormDialogProps = {
  description: string
  initialValues: TaskFormValues
  importanceOptions: PositionOption[]
  isOpen: boolean
  mode: 'create' | 'edit'
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TaskFormValues) => Promise<void>
  title: string
  urgencyOptions: PositionOption[]
}

export function TaskFormDialog({
  description,
  importanceOptions,
  initialValues,
  isOpen,
  mode,
  onOpenChange,
  onSubmit,
  title,
  urgencyOptions,
}: TaskFormDialogProps) {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(initialValues)
    setError(null)
  }, [initialValues, isOpen])

  const disableRankFields =
    importanceOptions.length === 0 || urgencyOptions.length === 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!values.title.trim()) {
      setError('A title is required.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      })
      onOpenChange(false)
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : 'Something went wrong while saving the task.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <p className="eyebrow">{mode === 'create' ? 'New task' : 'Edit task'}</p>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="Draft quarterly reflection"
              value={values.title}
              onChange={(event) =>
                setValues((current) => ({ ...current, title: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Add a short note for context."
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={values.dueDate}
                onChange={(event) =>
                  setValues((current) => ({ ...current, dueDate: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Resolution</Label>
              <Select
                value={values.resolutionType ?? 'none'}
                onValueChange={(next) =>
                  setValues((current) => ({
                    ...current,
                    resolutionType: next === 'none' ? null : (next as ResolutionType),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No resolution</SelectItem>
                  {RESOLUTION_VALUES.map((resolution) => (
                    <SelectItem key={resolution} value={resolution}>
                      {resolutionLabels[resolution]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Importance position</Label>
              <Select
                disabled={disableRankFields}
                value={String(values.importancePosition)}
                onValueChange={(next) =>
                  setValues((current) => ({
                    ...current,
                    importancePosition: Number(next),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {importanceOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Urgency position</Label>
              <Select
                disabled={disableRankFields}
                value={String(values.urgencyPosition)}
                onValueChange={(next) =>
                  setValues((current) => ({
                    ...current,
                    urgencyPosition: Number(next),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error ? <p className="text-sm text-[var(--tone-drop)]">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create task'
                  : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
