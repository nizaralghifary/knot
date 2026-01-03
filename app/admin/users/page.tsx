"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, CircleEllipsis, Trophy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface User {
    id: string;
    username: string;
    email: string;
    role: "admin" | "user";
    is_verified: boolean;
    created_at: Date;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                role: roleFilter,
            });

            const response = await fetch(`/api/admin/users?${params}`);
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users);
                setTotalPages(data.pagination.totalPages);
            } else {
                toast.error(data.error || "Failed to fetch users");
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search, roleFilter]);

    const handleDelete = async () => {
        if (!deleteUserId) return;

        try {
            const response = await fetch(`/api/admin/users?id=${deleteUserId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("User deleted successfully");
                fetchUsers();
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Failed to delete user");
        } finally {
            setDeleteUserId(null);
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold">Users Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage all registered users
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                View and manage user accounts
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-8"
                                />
                            </div>
                            <Select
                                value={roleFilter}
                                onValueChange={(value) => {
                                    setRoleFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-32">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No users found
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50">
                                    <div className="col-span-3">Username</div>
                                    <div className="col-span-4">Email</div>
                                    <div className="col-span-2">Role</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-1">Actions</div>
                                </div>

                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 border-b hover:bg-muted/50"
                                    >
                                        <div className="md:col-span-3">
                                            <span className="font-medium md:hidden">Username: </span>
                                            <span className="font-medium">{user.username}</span>
                                        </div>
                                        <div className="md:col-span-4 text-muted-foreground">
                                            <span className="font-medium md:hidden">Email: </span>
                                            {user.email}
                                        </div>
                                        <div className="md:col-span-2">
                                            <Badge
                                                variant={
                                                    user.role === "admin"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Badge
                                                variant={
                                                    user.is_verified
                                                        ? "default"
                                                        : "outline"
                                                }
                                            >
                                                {user.is_verified
                                                    ? "Verified"
                                                    : "Unverified"}
                                            </Badge>
                                        </div>
                                        <div className="md:col-span-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <CircleEllipsis className="h-5 w-5" />
                                                        <p className="block md:hidden">Options</p>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/users/${user.username}`}>
                                                            <Trophy className="h-4 w-4 mr-2" />
                                                            Exam Results
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {/*<DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            setDeleteUserId(user.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete User
                                                    </DropdownMenuItem>*/}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            user account and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}