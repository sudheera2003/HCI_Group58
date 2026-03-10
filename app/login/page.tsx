"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // SEND OTP CODE
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // true = Sign Up or Sign In automatically
        },
      });

      if (error) throw error;

      toast.success("OTP sent! Check your email.");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP CODE
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      if (session) {
        toast.success("Logged in successfully!");
        router.push("/dashboard"); // Redirect to your app home
      }
    } catch (error: any) {
      toast.error("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        
        {/* EMAIL ENTRY */}
        {step === "email" && (
          <form onSubmit={handleSendOtp}>
            <CardHeader className="text-center">
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Enter your email to receive a one-time login code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5 mt-3">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-3">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Code
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}

        {/* OTP ENTRY */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <CardHeader>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                We sent a 8-digit code to <span className="font-bold text-slate-700">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 mt-3">
              
              {/* SHADCN INPUT OTP */}
              <InputOTP
                maxLength={8}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                  <InputOTPSlot index={6} />
                  <InputOTPSlot index={7} />
                </InputOTPGroup>
              </InputOTP>

              <p className="text-xs text-slate-400 text-center">
                Can't find it? Check your spam folder.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 mt-3">
              <Button className="w-full" type="submit" disabled={loading || otp.length < 6}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Login"
                )}
              </Button>
              
              <Button
                variant="ghost"
                className="w-full text-xs text-slate-500"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-3 w-3" />
                Back to Email
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}