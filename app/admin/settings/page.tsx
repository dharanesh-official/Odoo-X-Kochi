import { getSettings } from "./actions"
import SettingsForm from "./settings-form"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground">Manage your subscription engine configuration.</p>
            <SettingsForm settings={settings} />
        </div>
    )
}
