import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface Backup {
  name: string;
  size: number;
  last_modified: number;
  download_url: string;
}

interface Props {
  backups: Backup[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Backup', href: '/backend/backup' },
];

export default function BackupIndex({ backups }: Props) {
  const [isRunning, setIsRunning] = React.useState(false);

  const handleBackup = () => {
    router.post('/backend/backup/run', {}, {
      onStart: () => setIsRunning(true),
      onFinish: () => setIsRunning(false),
      preserveScroll: true,
    });
  };

  const handleDelete = (filename: string) => {
    router.delete(`/backend/backup/delete/${filename}`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout title="Backup" breadcrumbs={breadcrumbs}>
      <Head title="Backup" />

      <div className="p-4 md:p-6 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Database Backups</CardTitle>
              <p className="text-muted-foreground text-sm">Manage system backup files</p>
            </div>
            <Button onClick={handleBackup} disabled={isRunning}>
              {isRunning ? 'Creating...' : 'Create Backup'}
            </Button>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4 space-y-4">
            {backups.length === 0 ? (
              <p className="text-muted-foreground text-center">No backups available.</p>
            ) : (
              <ul className="space-y-2">
                {backups.map((backup, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border rounded p-3 bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{backup.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSize(backup.size)} •{' '}
                        {new Date(backup.last_modified * 1000).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={backup.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">Download</Button>
                      </a>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this backup?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(backup.name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function formatSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

