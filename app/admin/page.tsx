import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/drizzle";
import { users, exams, examAttempts } from "@/lib/db/schema";
import { count, desc, sql } from "drizzle-orm";
import { PlusCircle, Users, FileText, BarChart3, Calendar, Clock, Edit, Trash2, Eye, DivideCircleIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function AdminPanel() {
    const session = await auth();

    if (!session || session?.user.role !== "admin") {
        redirect("/");
    }

    const [totalUsers, totalExams, totalAttempts, recentExams] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(exams),
        db.select({ count: count() }).from(examAttempts),
        db.select({
            id: exams.id,
            title: exams.title,
            is_published: exams.is_published,
            duration: exams.duration,
            created_at: exams.created_at,
            question_count: sql<number>`COUNT(${exams.id})`.as("question_count")
        })
            .from(exams)
            .leftJoin(users, sql`${exams.created_by} = ${users.id}`)
            .groupBy(exams.id)
            .orderBy(desc(exams.created_at))
            .limit(5)
    ])

    return (
        <main className="min-h-screen p-4 md:p-6">
            <div className="flex items-center justify-between mb-8">
                <Link href="/admin" className="flex items-center gap-x-2">
                    <h1 className="text-2xl font-semibold">Knot for Admin</h1>
                </Link>

                <div className="gap-2">
                    <a href="/admin/new-exam" className="p-2">
                        <PlusCircle className="h-6 w-6" />
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers[0]?.count || 0}</div>
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
                        <div className="text-2xl font-bold">{totalExams[0]?.count || 0}</div>
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
                        <div className="text-2xl font-bold">{totalAttempts[0]?.count || 0}</div>
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
                        <div className="text-2xl font-bold">
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

                        {recentExams.length > 0 ? ( recentExams.map((exam) => ( 
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
                                    {/*<Button variant="ghost" size="sm" asChild>
                                        <Link href={`/admin/exams/${exam.id}/edit`}>
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Link>
                                    </Button>*/}
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/admin/exams/${exam.id}`}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            <p className="hidden md:block">View</p>
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))) : (
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
                                Go to Users Management
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
                                Go to Settings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}