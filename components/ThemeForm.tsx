import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getAiThemeData } from "@/lib/ai";
import { themeAtom } from "@/lib/atoms";
import { useSetAtom } from "jotai";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  theme: z.string().min(2).max(50),
});

type FormSchema = z.infer<typeof formSchema>;

type ThemeFormProps = {
  setTheme(value: string): void;
};

export function ThemeForm(props: ThemeFormProps) {
  const setTheme = useSetAtom(themeAtom);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: "",
    },
  });

  async function onSubmit({ theme }: FormSchema) {
    const data = await getAiThemeData(theme);
    setTheme(data);
    props.setTheme(theme);
  }

  const loading = form.formState.isSubmitting;
  const submitted = form.formState.isSubmitSuccessful;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            disabled={loading || submitted}
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <FormControl>
                  <Input placeholder="car brands" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading || submitted}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
}
