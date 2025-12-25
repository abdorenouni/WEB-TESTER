import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Globe, Zap, Shield, Eye, Gauge, CheckCircle, AlertTriangle, XCircle, Loader2, Terminal, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Testing() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalyze = async () => {
    if (!url) {
      toast({ title: "Enter a URL to analyze", variant: "destructive" });
      return;
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { url: formattedUrl },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const analysis = data.data;
        
        // Save to database if user is logged in
        if (user) {
          await supabase.from("test_results").insert({
            user_id: user.id,
            url: formattedUrl,
            performance_score: analysis.performance,
            accessibility_score: analysis.accessibility,
            security_score: analysis.security,
            seo_score: analysis.seo,
            issues: analysis.issues,
          });
        }

        setResults(analysis);
        toast({ title: "Analysis Complete", description: analysis.summary });
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze the website",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <Layout>
      <section className="py-24 relative min-h-screen">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 hex-grid opacity-30" />
        
        {/* Floating effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-6">
              <Cpu className="w-4 h-4" />
              <span>NEURAL ANALYSIS ENGINE</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              <span className="text-foreground">AI-POWERED </span>
              <span className="text-gradient-cyber">TESTING</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-sans">
              Enter any URL and our AI will analyze performance, security, accessibility, and SEO in real-time.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto mb-12 cyber-card">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
                  <Input
                    placeholder="example.com or https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="pl-11 h-14 bg-muted/50 border-primary/20 font-mono text-lg"
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="h-14 px-8 bg-primary font-display shadow-neon-cyan text-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      ANALYZE
                    </>
                  )}
                </Button>
              </div>
              {isAnalyzing && (
                <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-mono text-primary">AI analyzing website structure, security headers, performance metrics...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {results && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              {/* Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Performance", value: results.performance, icon: Gauge },
                  { label: "Security", value: results.security, icon: Shield },
                  { label: "Accessibility", value: results.accessibility, icon: Eye },
                  { label: "SEO", value: results.seo, icon: CheckCircle },
                ].map((metric) => (
                  <Card key={metric.label} className="cyber-card group hover:border-primary/50 transition-all">
                    <CardContent className="p-6 text-center">
                      <metric.icon className={`w-8 h-8 mx-auto mb-3 ${getScoreColor(metric.value)}`} />
                      <div className={`text-5xl font-display font-bold ${getScoreColor(metric.value)} text-glow-cyan`}>
                        {metric.value}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono mt-2">{metric.label}</div>
                      <Progress value={metric.value} className="mt-4 h-1.5" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              {results.summary && (
                <Card className="cyber-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Terminal className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-display text-lg text-primary mb-2">ANALYSIS SUMMARY</h3>
                        <p className="text-foreground font-sans">{results.summary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Issues */}
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="font-display text-primary flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    DETECTED ISSUES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.issues?.length > 0 ? (
                    results.issues.map((issue: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-primary/10 hover:border-primary/30 transition-colors"
                      >
                        {issue.type === "error" && <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
                        {issue.type === "warning" && <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />}
                        {issue.type === "info" && <Terminal className="w-5 h-5 text-primary flex-shrink-0" />}
                        <span className="flex-1 font-sans text-foreground">{issue.message}</span>
                        {issue.count && (
                          <Badge variant="secondary" className="font-mono">
                            {issue.count}
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground font-mono text-center py-4">No critical issues detected</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Button */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setResults(null);
                    setUrl("");
                  }}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 font-display"
                >
                  ANALYZE ANOTHER URL
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
