import { getUsers, updateUserRole, promoteByEmail } from "./actions"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Internal Users</h1>
                    <p className="text-muted-foreground">Manage administrative and operational access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 border rounded-lg p-6 bg-card shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-4">Add User Role</h3>
                    <p className="text-xs text-muted-foreground mb-4">Users must first sign up via the Auth page. Use their email below to assign an internal role.</p>
                    <form action={async (formData) => {
                        'use server'
                        const email = formData.get('email') as string
                        const role = formData.get('role') as any
                        await promoteByEmail(email, role)
                    }} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">User Email</Label>
                            <Input id="email" name="email" placeholder="staff@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Assign Role</Label>
                            <Select name="role" defaultValue="internal">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="internal">Internal (Operations)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full">Assign Role</Button>
                    </form>
                </div>

                <div className="md:col-span-2 border rounded-lg bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'internal' ? 'secondary' : 'outline'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <form action={async (formData) => {
                                            'use server'
                                            const role = formData.get('role') as any
                                            await updateUserRole(user.id, role)
                                        }}>
                                            <div className="flex justify-end gap-2">
                                                <Select name="role" defaultValue={user.role}>
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="internal">Internal</SelectItem>
                                                        <SelectItem value="customer">Customer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button size="sm" type="submit">Update</Button>
                                            </div>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
