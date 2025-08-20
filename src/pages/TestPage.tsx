import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail, Zap } from "lucide-react";
import EmailTestPanel from "@/components/EmailTestPanel";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Page de Test</h1>
          <p className="text-gray-600">Tests et outils de développement pour l'application e-commerce</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Application */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Application
              </CardTitle>
              <CardDescription>Status de l'application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="default">En ligne</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Port:</span>
                  <span className="font-mono">8080</span>
                </div>
                <div className="flex justify-between">
                  <span>Environnement:</span>
                  <Badge variant="secondary">Développement</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* E-mails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                E-mails
              </CardTitle>
              <CardDescription>Service d'e-mail Resend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <Badge variant="outline">Resend</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Gratuit:</span>
                  <span className="text-sm">3,000/mois</span>
                </div>
                <div className="flex justify-between">
                  <span>Templates:</span>
                  <Badge variant="default">Prêts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Performance
              </CardTitle>
              <CardDescription>Optimisations actives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Lazy Loading:</span>
                  <Badge variant="default">✅</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Code Splitting:</span>
                  <Badge variant="default">✅</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Caching:</span>
                  <Badge variant="default">✅</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test des E-mails */}
        <div className="mb-8">
          <EmailTestPanel />
        </div>
      </div>
    </div>
  );
};

export default TestPage;
