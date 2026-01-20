import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { MessageSquare, Send } from "lucide-react";
import { apiRequest } from "../lib/queryClient";

const commentFormSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must not exceed 1000 characters"),
  name: z.string().max(100).optional(),
  contactInfo: z.string().max(200).optional(),
  contextType: z.enum(["general", "abr", "sre", "dfur"]).optional(),
});

type CommentFormData = z.infer<typeof commentFormSchema>;

interface ViewerCommentFormProps {
  contextType?: "general" | "abr" | "sre" | "dfur";
}

export function ViewerCommentForm({ contextType = "general" }: ViewerCommentFormProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      message: "",
      name: "",
      contactInfo: "",
      contextType: contextType,
    },
  });

  const submitCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      const response = await apiRequest("POST", "/api/viewer-comments", data);
      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Comment Submitted",
        description: "Thank you for your feedback! Your comment has been submitted for review.",
      });
      setIsSubmitted(true);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentFormData) => {
    submitCommentMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-800 dark:text-green-200" data-testid="message-comment-success">
            <MessageSquare className="h-5 w-5" />
            <p className="font-medium">Your comment has been submitted successfully!</p>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-2 mb-4">
            We appreciate your feedback. Our team will review your comment.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            data-testid="button-submit-another"
          >
            Submit Another Comment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Us Your Comments
        </CardTitle>
        <CardDescription>
          Your feedback helps us improve our financial transparency and services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Your name"
                {...form.register("name")}
                disabled={submitCommentMutation.isPending}
                data-testid="input-comment-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Info (Optional)</Label>
              <Input
                id="contactInfo"
                placeholder="Email or phone"
                {...form.register("contactInfo")}
                disabled={submitCommentMutation.isPending}
                data-testid="input-comment-contact"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Your Comment <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Share your thoughts, questions, or suggestions about our barangay's financial reports..."
              className="min-h-[120px] resize-none"
              {...form.register("message")}
              disabled={submitCommentMutation.isPending}
              data-testid="input-comment-message"
            />
            {form.formState.errors.message && (
              <p className="text-sm text-destructive" data-testid="error-message-validation">
                {form.formState.errors.message.message}
              </p>
            )}
            {form.formState.errors.name && (
              <p className="text-sm text-destructive" data-testid="error-name-validation">
                {form.formState.errors.name.message}
              </p>
            )}
            {form.formState.errors.contactInfo && (
              <p className="text-sm text-destructive" data-testid="error-contact-validation">
                {form.formState.errors.contactInfo.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {form.watch("message")?.length || 0} / 1000 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitCommentMutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-submit-comment"
          >
            {submitCommentMutation.isPending ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Comment
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-2">
            Note: Your comment will be reviewed by our team before being published. You may submit comments anonymously.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
