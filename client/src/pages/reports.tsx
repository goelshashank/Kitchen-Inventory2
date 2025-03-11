import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, CalendarX } from "lucide-react";
import { format } from "date-fns";

export default function Reports() {
  // Fetch reports data
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports"]
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <Tabs defaultValue="low-stock">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
              <TabsTrigger value="usage">Usage Stats</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <TabsContent value="low-stock" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="text-warning mr-2 h-5 w-5" />
                  Low Stock Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : reports?.lowStock.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Minimum Level</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.lowStock.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}{item.unit}</TableCell>
                          <TableCell>{item.minimumStock}{item.unit}</TableCell>
                          <TableCell>{item.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Alert>
                    <AlertTitle>All stocked up!</AlertTitle>
                    <AlertDescription>
                      You don't have any ingredients below their minimum stock levels.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiring" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarX className="text-danger mr-2 h-5 w-5" />
                  Expiring Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : reports?.expiring.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Days Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.expiring.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}{item.unit}</TableCell>
                          <TableCell>{format(new Date(item.expiryDate), 'MMM d, yyyy')}</TableCell>
                          <TableCell className={item.daysLeft <= 0 ? "text-danger font-bold" : "text-warning"}>
                            {item.daysLeft <= 0 ? "Expired" : `${item.daysLeft} days`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Alert>
                    <AlertTitle>Nothing expiring soon!</AlertTitle>
                    <AlertDescription>
                      None of your ingredients are expiring in the next 7 days.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Ingredient Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : reports?.mostUsed.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Used In</TableHead>
                        <TableHead>Current Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.mostUsed.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.recipeCount} recipes</TableCell>
                          <TableCell>{item.quantity}{item.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No usage data available</AlertTitle>
                    <AlertDescription>
                      Add some recipes that use your ingredients to see usage statistics.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
