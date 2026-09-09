import { requireUser } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile & Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name ?? ""} email={user.email ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
