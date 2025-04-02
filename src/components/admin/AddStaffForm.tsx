import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { StaffRole, LetterGrade } from '@/types/staff';
import { useStaff } from '@/contexts/StaffContext';
import { uploadStaffImage } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Upload } from 'lucide-react';
import { calculateLetterGrade } from '@/services/supabaseService';

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  role: z.enum(['Moderator', 'Builder', 'Manager', 'Owner']),
  // Define metrics based on role
  responsiveness: z.number().min(0).max(10).optional(),
  fairness: z.number().min(0).max(10).optional(),
  communication: z.number().min(0).max(10).optional(),
  conflictResolution: z.number().min(0).max(10).optional(),
  ruleEnforcement: z.number().min(0).max(10).optional(),
  engagement: z.number().min(0).max(10).optional(),
  supportiveness: z.number().min(0).max(10).optional(),
  adaptability: z.number().min(0).max(10).optional(),
  objectivity: z.number().min(0).max(10).optional(),
  initiative: z.number().min(0).max(10).optional(),
  // Builder metrics
  exterior: z.number().min(0).max(10).optional(),
  interior: z.number().min(0).max(10).optional(),
  decoration: z.number().min(0).max(10).optional(),
  effort: z.number().min(0).max(10).optional(),
  contribution: z.number().min(0).max(10).optional(),
  cooperativeness: z.number().min(0).max(10).optional(),
  creativity: z.number().min(0).max(10).optional(),
  consistency: z.number().min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddStaffForm: React.FC = () => {
  const { addStaffMember } = useStaff();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      role: 'Moderator',
      // Default values for metrics
      responsiveness: 5,
      fairness: 5,
      communication: 5,
      conflictResolution: 5,
      ruleEnforcement: 5,
      engagement: 5,
      supportiveness: 5,
      adaptability: 5,
      objectivity: 5,
      initiative: 5,
      // Builder metrics
      exterior: 5,
      interior: 5,
      decoration: 5,
      effort: 5,
      contribution: 5,
      cooperativeness: 5,
      creativity: 5,
      consistency: 5,
    },
  });

  // Get the current role value to conditionally render form fields
  const currentRole = form.watch('role');

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear the selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create metrics based on role
      const metrics: any = {};
      
      if (values.role === 'Moderator') {
        metrics.responsiveness = { score: values.responsiveness || 5, letterGrade: calculateLetterGrade(values.responsiveness || 5) };
        metrics.fairness = { score: values.fairness || 5, letterGrade: calculateLetterGrade(values.fairness || 5) };
        metrics.communication = { score: values.communication || 5, letterGrade: calculateLetterGrade(values.communication || 5) };
        metrics.conflictResolution = { score: values.conflictResolution || 5, letterGrade: calculateLetterGrade(values.conflictResolution || 5) };
        metrics.ruleEnforcement = { score: values.ruleEnforcement || 5, letterGrade: calculateLetterGrade(values.ruleEnforcement || 5) };
        metrics.engagement = { score: values.engagement || 5, letterGrade: calculateLetterGrade(values.engagement || 5) };
        metrics.supportiveness = { score: values.supportiveness || 5, letterGrade: calculateLetterGrade(values.supportiveness || 5) };
        metrics.adaptability = { score: values.adaptability || 5, letterGrade: calculateLetterGrade(values.adaptability || 5) };
        metrics.objectivity = { score: values.objectivity || 5, letterGrade: calculateLetterGrade(values.objectivity || 5) };
        metrics.initiative = { score: values.initiative || 5, letterGrade: calculateLetterGrade(values.initiative || 5) };
      } else if (values.role === 'Builder') {
        metrics.exterior = { score: values.exterior || 5, letterGrade: calculateLetterGrade(values.exterior || 5) };
        metrics.interior = { score: values.interior || 5, letterGrade: calculateLetterGrade(values.interior || 5) };
        metrics.decoration = { score: values.decoration || 5, letterGrade: calculateLetterGrade(values.decoration || 5) };
        metrics.effort = { score: values.effort || 5, letterGrade: calculateLetterGrade(values.effort || 5) };
        metrics.contribution = { score: values.contribution || 5, letterGrade: calculateLetterGrade(values.contribution || 5) };
        metrics.communication = { score: values.communication || 5, letterGrade: calculateLetterGrade(values.communication || 5) };
        metrics.adaptability = { score: values.adaptability || 5, letterGrade: calculateLetterGrade(values.adaptability || 5) };
        metrics.cooperativeness = { score: values.cooperativeness || 5, letterGrade: calculateLetterGrade(values.cooperativeness || 5) };
        metrics.creativity = { score: values.creativity || 5, letterGrade: calculateLetterGrade(values.creativity || 5) };
        metrics.consistency = { score: values.consistency || 5, letterGrade: calculateLetterGrade(values.consistency || 5) };
      } else if (values.role === 'Manager' || values.role === 'Owner') {
        // For managers, we include all metrics with high default values
        metrics.responsiveness = { score: 10, letterGrade: 'S+' };
        metrics.fairness = { score: 10, letterGrade: 'S+' };
        metrics.communication = { score: 10, letterGrade: 'S+' };
        metrics.conflictResolution = { score: 10, letterGrade: 'S+' };
        metrics.ruleEnforcement = { score: 10, letterGrade: 'S+' };
        metrics.engagement = { score: 10, letterGrade: 'S+' };
        metrics.supportiveness = { score: 10, letterGrade: 'S+' };
        metrics.adaptability = { score: 10, letterGrade: 'S+' };
        metrics.objectivity = { score: 10, letterGrade: 'S+' };
        metrics.initiative = { score: 10, letterGrade: 'S+' };
        metrics.exterior = { score: 10, letterGrade: 'S+' };
        metrics.interior = { score: 10, letterGrade: 'S+' };
        metrics.decoration = { score: 10, letterGrade: 'S+' };
        metrics.effort = { score: 10, letterGrade: 'S+' };
        metrics.contribution = { score: 10, letterGrade: 'S+' };
        metrics.cooperativeness = { score: 10, letterGrade: 'S+' };
        metrics.creativity = { score: 10, letterGrade: 'S+' };
        metrics.consistency = { score: 10, letterGrade: 'S+' };
      }
      
      // Calculate overall score and grade
      const metricValues = Object.values(metrics).map((m: any) => m.score);
      const overallScore = metricValues.reduce((sum: number, score: number) => sum + score, 0) / metricValues.length;
      const overallGrade = values.role === 'Manager' || values.role === 'Owner' 
        ? 'SSS+' as LetterGrade 
        : calculateLetterGrade(overallScore);
      
      // Create the staff member object
      const newStaffMember = {
        name: values.name,
        role: values.role as StaffRole,
        metrics,
        overallScore,
        overallGrade,
        avatar: '/placeholder.svg', // Default avatar
      };
      
      // If there's an image file, upload it first
      if (imageFile) {
        // Generate a temporary ID for the image upload
        const tempId = `temp-${Date.now()}`;
        // Upload the image and get the URL
        const uploadedUrl = await uploadStaffImage(imageFile, tempId, values.role as StaffRole);
        if (uploadedUrl) {
          newStaffMember.avatar = uploadedUrl;
        }
      }
      
      // Add the staff member
      await addStaffMember(newStaffMember);
      
      // Reset the form
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      
      toast({
        title: "Staff Member Added",
        description: `${values.name} has been added as a ${values.role}.`,
      });
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cyber-panel p-6">
      <h2 className="text-xl font-digital mb-6 text-cyber-cyan">Add New Staff Member</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter staff name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Role Selection */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Moderator">Moderator</SelectItem>
                    <SelectItem value="Builder">Builder</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Image Upload */}
          <div className="space-y-2">
            <FormLabel>Profile Image</FormLabel>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-cyber-cyan">
                  <AvatarImage src={imagePreview || '/placeholder.svg'} />
                  <AvatarFallback className="bg-cyber-darkpurple text-cyber-cyan">
                    {form.watch('name')
                      ? form.watch('name')
                          .split(' ')
                          .map(part => part[0])
                          .join('')
                          .toUpperCase()
                      : 'NEW'}
                  </AvatarFallback>
                </Avatar>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div>
                <label className="cyber-button py-2 px-4 cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="text-xs mt-1 text-gray-400">
                  Recommended: 256x256px, max 5MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Conditional Metrics based on Role */}
          <div className="space-y-4">
            <h3 className="text-lg font-digital text-cyber-cyan">Performance Metrics</h3>
            
            {/* Moderator Metrics */}
            {currentRole === 'Moderator' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Responsiveness */}
                <FormField
                  control={form.control}
                  name="responsiveness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsiveness</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Fairness */}
                <FormField
                  control={form.control}
                  name="fairness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fairness</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Communication */}
                <FormField
                  control={form.control}
                  name="communication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Conflict Resolution */}
                <FormField
                  control={form.control}
                  name="conflictResolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conflict Resolution</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Rule Enforcement */}
                <FormField
                  control={form.control}
                  name="ruleEnforcement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Enforcement</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Engagement */}
                <FormField
                  control={form.control}
                  name="engagement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engagement</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Supportiveness */}
                <FormField
                  control={form.control}
                  name="supportiveness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supportiveness</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Adaptability */}
                <FormField
                  control={form.control}
                  name="adaptability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adaptability</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Objectivity */}
                <FormField
                  control={form.control}
                  name="objectivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectivity</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Initiative */}
                <FormField
                  control={form.control}
                  name="initiative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initiative</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Builder Metrics */}
            {currentRole === 'Builder' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Exterior */}
                <FormField
                  control={form.control}
                  name="exterior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exterior</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Interior */}
                <FormField
                  control={form.control}
                  name="interior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interior</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Decoration */}
                <FormField
                  control={form.control}
                  name="decoration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decoration</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Effort */}
                <FormField
                  control={form.control}
                  name="effort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effort</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Contribution */}
                <FormField
                  control={form.control}
                  name="contribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contribution</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Communication */}
                <FormField
                  control={form.control}
                  name="communication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Adaptability */}
                <FormField
                  control={form.control}
                  name="adaptability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adaptability</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Cooperativeness */}
                <FormField
                  control={form.control}
                  name="cooperativeness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooperativeness</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Creativity */}
                <FormField
                  control={form.control}
                  name="creativity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Creativity</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Consistency */}
                <FormField
                  control={form.control}
                  name="consistency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consistency</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="w-10 text-center font-mono">
                          {field.value || 5}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Manager/Owner Message */}
            {(currentRole === 'Manager' || currentRole === 'Owner') && (
              <div className="bg-cyber-darkpurple/50 p-4 rounded-lg border border-cyber-cyan">
                <p className="text-cyber-cyan">
                  Managers and Owners automatically receive perfect scores across all metrics.
                </p>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full cyber-button-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Staff Member'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddStaffForm;
