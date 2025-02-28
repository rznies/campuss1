import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export function ResponsiveCard({ title, children }) {
  return (
    <Card className="w-full max-w-sm mx-auto sm:max-w-md md:max-w-lg">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        {children}
      </CardContent>
    </Card>
  );
} 