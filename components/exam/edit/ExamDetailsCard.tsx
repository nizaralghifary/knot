import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExamDetailsCardProps } from "./types";

export function ExamDetailsCard({ examData, onExamDataChange }: ExamDetailsCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Exam Details</CardTitle>
        <CardDescription>Update basic information about the exam</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title" className="mb-2">Exam Title *</Label>
          <Input
            id="title"
            value={examData.title}
            onChange={(e) => onExamDataChange({...examData, title: e.target.value})}
            placeholder="Mathematics Final Exam"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-2">Description</Label>
          <Textarea
            id="description"
            value={examData.description}
            onChange={(e) => onExamDataChange({...examData, description: e.target.value})}
            placeholder="Describe what this exam covers..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration" className="mb-2">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={examData.duration || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  onExamDataChange({...examData, duration: 0});
                } else {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue)) {
                    onExamDataChange({...examData, duration: numValue});
                  }
                }
              }}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="publish">Publish Exam</Label>
              <p className="text-sm text-muted-foreground">
                Make exam available to users
              </p>
            </div>
            <Switch
              id="publish"
              checked={examData.is_published}
              onCheckedChange={(checked) => onExamDataChange({...examData, is_published: checked})}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}