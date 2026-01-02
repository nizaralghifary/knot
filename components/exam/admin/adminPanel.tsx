"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Users, FileText, BarChart3, Calendar, Clock, Edit, Trash2, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Exam = {
  id: string;
  title: string;
  is_published: boolean | null;
  duration: number;
  created_at: Date;
  question_count: number;
};

interface AdminPanelProps {
  totalUsers: number;
  totalExams: number;
  totalAttempts: number;
  recentExams: Exam[];
}

export default function AdminPanel({
  totalUsers,
  totalExams,
  totalAttempts,
  recentExams
}: AdminPanelProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>(recentExams);

  const handleDeleteExam = async (examId: string) => {
    setDeleting(examId);
    
    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete exam");
      }

      setExams(prev => prev.filter(exam => exam.id !== examId));
      
      toast.success("Exam deleted successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error("Error deleting exam", {
        description: error.message,
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <Link href="/admin" className="flex items-center gap-x-2">
          <h1 className="text-2xl font-semibold">KnotExam Admin</h1>
        </Link>

        <div className="gap-2">
          <Link href="/admin/new-exam" className="p-2">
            <PlusCircle className="h-6 w-6" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalExams}</div>
            <p className="text-xs text-muted-foreground">
              Created exams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Exam attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {format(new Date(), "MMM d")}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Exams</CardTitle>
          <CardDescription>Recently created exams and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-3">Actions</div>
            </div>

            {exams.length > 0 ? ( 
              exams.map((exam) => ( 
                <div key={exam.id} className="grid grid-cols-12 gap-4 p-4 border-b items-center hover:bg-muted/50">
                  <div className="col-span-5 font-medium">{exam.title}</div>
                  <div className="col-span-2">
                    <Badge variant={exam.is_published ? "default" : "secondary"}>
                      {exam.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{exam.duration} min</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/exams/${exam.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">View</span>
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          disabled={deleting === exam.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deleting === exam.id && (
                            <span className="ml-1">Deleting...</span>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            exam "{exam.title}" and all associated questions, attempts, and results.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteExam(exam.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleting === exam.id ? "Deleting..." : "Delete Exam"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No exams created yet. Create your first exam!
              </div>
            )}
          </div>        
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View and manage all users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                View Users Management
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Analytics</CardTitle>
            <CardDescription>View exam performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Admin settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                View Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}