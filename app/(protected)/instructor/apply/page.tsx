"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { instructorService } from "@/lib/api/instructorService";
import { InstructorApplicationForm } from "@/lib/types";

export default function InstructorApplyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<InstructorApplicationForm>();

  const onSubmit = async (data: InstructorApplicationForm) => {
    setIsLoading(true);
    try {
      await instructorService.createProfile(data);
      toast.success("Application submitted!");
      router.push("/instructor/dashboard");
    } catch (error) {
      toast.error("Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Apply as Instructor</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              {...register("bio")}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Education</label>
            <textarea
              {...register("education")}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Experience</label>
            <textarea
              {...register("experience")}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Certificates
            </label>
            <textarea
              {...register("certificates")}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {isLoading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
