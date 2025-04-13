import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StarBackground from '@/components/ui/star-background';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Edit, 
  Plus, 
  Trash, 
  Link as LinkIcon, 
  AtSign, 
  Globe, 
  Twitter, 
  Instagram, 
  Youtube, 
  Twitch, 
  Store, 
  CalendarDays,
  Sparkles,
  MoveDiagonal
} from 'lucide-react';

// Avatar schema for form validation
const avatarFormSchema = z.object({
  avatarType: z.enum(["echo", "helios"]),
  primaryColor: z.string().min(4).max(7),
  secondaryColor: z.string().min(4).max(7),
  animationStyle: z.enum(["wave", "pulse", "rotate", "none"]),
});

// Profile form schema
const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  bio: z.string().max(8000, {
    message: "Bio cannot exceed 8000 characters."
  }),
});

// Link form schema
const linkFormSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  icon: z.string().default("link"),
});

// Avatar settings and profile types
type AvatarFormValues = z.infer<typeof avatarFormSchema>;
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type LinkFormValues = z.infer<typeof linkFormSchema>;

const ProfilePage = () => {
  const { username } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  
  // Fetch user profile data
  const { data: userData, isLoading, error } = useQuery({
    queryKey: [`/api/users/${username}`],
    retry: 1,
  });
  
  // Fetch user's profile links
  const { data: userLinks, isLoading: isLoadingLinks } = useQuery({
    queryKey: [`/api/users/${userData?.id}/links`],
    enabled: !!userData?.id,
  });
  
  // Fetch user's fan posts
  const { data: fanPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: [`/api/users/${userData?.id}/fanposts`],
    enabled: !!userData?.id,
  });
  
  // Fetch user's store items
  const { data: storeItems, isLoading: isLoadingStore } = useQuery({
    queryKey: [`/api/users/${userData?.id}/store`],
    enabled: !!userData?.id,
  });
  
  // Setup form for avatar customization
  const avatarForm = useForm<AvatarFormValues>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      avatarType: "echo",
      primaryColor: "#6A0DAD",
      secondaryColor: "#50E3C2",
      animationStyle: "pulse",
    },
  });
  
  // Setup form for profile editing
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      bio: "",
    },
  });
  
  // Setup form for adding links
  const linkForm = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      icon: "link",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!userData?.id) throw new Error("User ID is required");
      return apiRequest('PATCH', `/api/users/${userData.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
      toast({
        title: "Profile updated",
        description: "Your cosmic profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  // Add link mutation
  const addLinkMutation = useMutation({
    mutationFn: async (data: LinkFormValues) => {
      if (!userData?.id) throw new Error("User ID is required");
      return apiRequest('POST', `/api/users/${userData.id}/links`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}/links`] });
      toast({
        title: "Link added",
        description: "Your cosmic link has been added successfully.",
      });
      setIsAddingLink(false);
      linkForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add link",
        description: error instanceof Error ? error.message : "Failed to add link",
        variant: "destructive",
      });
    },
  });
  
  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: number) => {
      return apiRequest('DELETE', `/api/links/${linkId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userData?.id}/links`] });
      toast({
        title: "Link removed",
        description: "Your cosmic link has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove link",
        description: error instanceof Error ? error.message : "Failed to remove link",
        variant: "destructive",
      });
    },
  });
  
  // Update avatar settings mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (data: AvatarFormValues) => {
      if (!userData?.id) throw new Error("User ID is required");
      return apiRequest('PATCH', `/api/users/${userData.id}`, {
        avatarType: data.avatarType,
        avatarSettings: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          animationStyle: data.animationStyle,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
      toast({
        title: "Avatar updated",
        description: "Your cosmic avatar has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update avatar",
        variant: "destructive",
      });
    },
  });
  
  // Set initial form values when data is loaded
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        displayName: userData.displayName,
        bio: userData.bio || "",
      });
      
      if (userData.avatarSettings) {
        const settings = userData.avatarSettings;
        avatarForm.reset({
          avatarType: userData.avatarType || "echo",
          primaryColor: settings.primaryColor || "#6A0DAD",
          secondaryColor: settings.secondaryColor || "#50E3C2",
          animationStyle: settings.animationStyle || "pulse",
        });
      }
    }
  }, [userData, profileForm, avatarForm]);
  
  // Handle profile form submission
  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  // Handle avatar form submission
  const onAvatarSubmit = (values: AvatarFormValues) => {
    updateAvatarMutation.mutate(values);
  };
  
  // Handle link form submission
  const onLinkSubmit = (values: LinkFormValues) => {
    addLinkMutation.mutate(values);
  };
  
  // Handle link deletion
  const handleDeleteLink = (linkId: number) => {
    deleteLinkMutation.mutate(linkId);
  };
  
  // Get icon component based on link title or icon name
  const getLinkIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('twitter')) return <Twitter size={18} />;
    if (lowerName.includes('instagram')) return <Instagram size={18} />;
    if (lowerName.includes('youtube')) return <Youtube size={18} />;
    if (lowerName.includes('twitch')) return <Twitch size={18} />;
    if (lowerName.includes('store') || lowerName.includes('shop')) return <Store size={18} />;
    if (lowerName.includes('website')) return <Globe size={18} />;
    return <LinkIcon size={18} />;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <>
        <StarBackground starCount={100} />
        <Header />
        <main className="relative z-10 container mx-auto px-4 py-12">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="cosmic-card p-8 rounded-xl text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-foreground/70">Loading cosmic profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Error state
  if (error || !userData) {
    return (
      <>
        <StarBackground starCount={100} />
        <Header />
        <main className="relative z-10 container mx-auto px-4 py-12">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="cosmic-card p-8 rounded-xl text-center max-w-lg">
              <h2 className="text-2xl font-bold font-montserrat mb-4">Cosmic Anomaly Detected</h2>
              <p className="text-foreground/70 mb-6">This cosmic traveler doesn't exist in our universe or their profile is hidden behind a nebula.</p>
              <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/80">
                Return to the Cosmic Hub
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <StarBackground starCount={100} />
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile header */}
          <motion.div 
            className="cosmic-card p-6 rounded-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar visualization */}
              <div className="w-32 h-32 md:w-40 md:h-40 relative">
                <div 
                  className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center animate-${userData.avatarSettings?.animationStyle || 'pulse'}`}
                  style={{
                    background: `radial-gradient(circle, ${userData.avatarSettings?.primaryColor || '#6A0DAD'} 0%, ${userData.avatarSettings?.secondaryColor || '#50E3C2'} 100%)`,
                  }}
                >
                  {userData.avatarType === 'helios' ? (
                    <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-50">
                      <polygon points="50,10 61,35 90,35 65,55 75,80 50,65 25,80 35,55 10,35 39,35" fill="rgba(255,255,255,0.8)" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-50">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                      <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                    </svg>
                  )}
                </div>
                
                {/* Avatar edit button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-primary/20 border-primary/50 hover:bg-primary/30"
                    >
                      <Edit size={14} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="cosmic-card">
                    <DialogHeader>
                      <DialogTitle>Customize Your Cosmic Avatar</DialogTitle>
                      <DialogDescription>
                        Choose your avatar type and customize its appearance to reflect your cosmic identity.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...avatarForm}>
                      <form onSubmit={avatarForm.handleSubmit(onAvatarSubmit)} className="space-y-4">
                        <FormField
                          control={avatarForm.control}
                          name="avatarType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Avatar Type</FormLabel>
                              <div className="flex gap-4">
                                <div 
                                  className={`cosmic-card p-4 rounded-lg cursor-pointer transition-all ${field.value === 'echo' ? 'ring-2 ring-primary' : 'opacity-70'}`}
                                  onClick={() => field.onChange('echo')}
                                >
                                  <div className="h-20 w-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-80">
                                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                                      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                                    </svg>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-medium">Echo</p>
                                    <p className="text-xs text-foreground/60">Harmonic resonator</p>
                                  </div>
                                </div>
                                
                                <div 
                                  className={`cosmic-card p-4 rounded-lg cursor-pointer transition-all ${field.value === 'helios' ? 'ring-2 ring-secondary' : 'opacity-70'}`}
                                  onClick={() => field.onChange('helios')}
                                >
                                  <div className="h-20 w-20 mx-auto rounded-full bg-secondary/20 flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-80">
                                      <polygon points="50,10 61,35 90,35 65,55 75,80 50,65 25,80 35,55 10,35 39,35" fill="currentColor" />
                                    </svg>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-medium">Helios</p>
                                    <p className="text-xs text-foreground/60">Stellar illuminator</p>
                                  </div>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={avatarForm.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Color</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input type="color" {...field} className="w-12 h-10 cosmic-input" />
                                  </FormControl>
                                  <Input 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                    className="cosmic-input flex-1" 
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={avatarForm.control}
                            name="secondaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Color</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input type="color" {...field} className="w-12 h-10 cosmic-input" />
                                  </FormControl>
                                  <Input 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                    className="cosmic-input flex-1" 
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={avatarForm.control}
                          name="animationStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Animation Style</FormLabel>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <Button 
                                  type="button"
                                  variant={field.value === 'wave' ? 'default' : 'outline'}
                                  className={field.value === 'wave' ? 'bg-primary' : ''}
                                  onClick={() => field.onChange('wave')}
                                >
                                  Wave
                                </Button>
                                <Button 
                                  type="button"
                                  variant={field.value === 'pulse' ? 'default' : 'outline'}
                                  className={field.value === 'pulse' ? 'bg-primary' : ''}
                                  onClick={() => field.onChange('pulse')}
                                >
                                  Pulse
                                </Button>
                                <Button 
                                  type="button"
                                  variant={field.value === 'rotate' ? 'default' : 'outline'}
                                  className={field.value === 'rotate' ? 'bg-primary' : ''}
                                  onClick={() => field.onChange('rotate')}
                                >
                                  Rotate
                                </Button>
                                <Button 
                                  type="button"
                                  variant={field.value === 'none' ? 'default' : 'outline'}
                                  className={field.value === 'none' ? 'bg-primary' : ''}
                                  onClick={() => field.onChange('none')}
                                >
                                  None
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit" className="bg-primary hover:bg-primary/80">
                            Save Avatar
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold font-montserrat cosmic-gradient-text mb-1">
                      {userData.displayName}
                    </h1>
                    <p className="text-foreground/60 flex justify-center md:justify-start items-center gap-1 mb-4">
                      <AtSign size={14} />
                      {userData.username}
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mb-4 md:mb-0"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
                
                {isEditing ? (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="cosmic-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                className="cosmic-input min-h-[150px]"
                                maxLength={8000}
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value.length}/8000 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="submit" className="bg-primary hover:bg-primary/80">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="cosmic-card p-4 rounded-lg bg-card/30 backdrop-blur-sm">
                    {userData.bio ? (
                      <p className="whitespace-pre-wrap">{userData.bio}</p>
                    ) : (
                      <p className="text-foreground/50 italic">No bio yet. Click 'Edit Profile' to add your cosmic story.</p>
                    )}
                  </div>
                )}
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Cosmic Links</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setIsAddingLink(true)}
                    >
                      <Plus size={14} className="mr-1" /> Add Link
                    </Button>
                  </div>
                  
                  {isLoadingLinks ? (
                    <div className="text-center py-4 text-foreground/60">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                      Loading links...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userLinks && userLinks.length > 0 ? (
                        userLinks.map((link: any) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group cosmic-card px-3 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-all"
                          >
                            {getLinkIcon(link.icon || link.title)}
                            <span>{link.title}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteLink(link.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/60 hover:text-foreground"
                            >
                              <Trash size={14} />
                            </button>
                          </a>
                        ))
                      ) : (
                        <p className="text-foreground/50 italic w-full text-center py-2">
                          No links added yet. Add links to connect your cosmic universe.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Add Link Dialog */}
          <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
            <DialogContent className="cosmic-card">
              <DialogHeader>
                <DialogTitle>Add Cosmic Link</DialogTitle>
                <DialogDescription>
                  Connect your digital universe with customizable links to all your platforms and content.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...linkForm}>
                <form onSubmit={linkForm.handleSubmit(onLinkSubmit)} className="space-y-4">
                  <FormField
                    control={linkForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Twitter, Portfolio, Store, etc." className="cosmic-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={linkForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." className="cosmic-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={linkForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon Type</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            type="button"
                            variant={field.value === 'link' ? 'default' : 'outline'}
                            className={field.value === 'link' ? 'bg-primary' : ''}
                            onClick={() => field.onChange('link')}
                          >
                            <LinkIcon size={14} className="mr-2" /> Link
                          </Button>
                          <Button 
                            type="button"
                            variant={field.value === 'twitter' ? 'default' : 'outline'}
                            className={field.value === 'twitter' ? 'bg-primary' : ''}
                            onClick={() => field.onChange('twitter')}
                          >
                            <Twitter size={14} className="mr-2" /> Twitter
                          </Button>
                          <Button 
                            type="button"
                            variant={field.value === 'instagram' ? 'default' : 'outline'}
                            className={field.value === 'instagram' ? 'bg-primary' : ''}
                            onClick={() => field.onChange('instagram')}
                          >
                            <Instagram size={14} className="mr-2" /> Insta
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingLink(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/80">
                      Add Link
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Content Tabs */}
          <Tabs defaultValue="fan-wall" className="mt-8">
            <TabsList className="grid grid-cols-4 max-w-xl mx-auto mb-8">
              <TabsTrigger value="fan-wall">Fan Wall</TabsTrigger>
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="nft">NFTs</TabsTrigger>
            </TabsList>
            
            {/* Fan Wall Tab */}
            <TabsContent value="fan-wall">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="cosmic-card p-6 rounded-xl">
                  <h2 className="text-2xl font-bold font-montserrat mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-accent" />
                    Fan Wall
                  </h2>
                  
                  {/* Fan post input */}
                  <div className="mb-8">
                    <Textarea 
                      placeholder="Share your cosmic thoughts with this creator..."
                      className="cosmic-input min-h-[80px] mb-2"
                    />
                    <div className="flex justify-end">
                      <Button className="bg-primary hover:bg-primary/80">
                        Post
                      </Button>
                    </div>
                  </div>
                  
                  {/* Fan posts list */}
                  {isLoadingPosts ? (
                    <div className="text-center py-8 text-foreground/60">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                      Loading cosmic messages...
                    </div>
                  ) : fanPosts && fanPosts.length > 0 ? (
                    <div className="space-y-4">
                      {fanPosts.map((post: any) => (
                        <div key={post.id} className="flex gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                            <div className="w-full h-full bg-primary/40 flex items-center justify-center">
                              <span className="font-semibold">{post.user.displayName.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="cosmic-card p-3 rounded-lg flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium">{post.user.displayName}</p>
                              <p className="text-xs text-foreground/60">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm">{post.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 cosmic-card bg-card/30 rounded-xl">
                      <h3 className="text-xl font-semibold mb-2">The Cosmic Wall Awaits</h3>
                      <p className="text-foreground/60 mb-4">Be the first to leave a message in this cosmic space.</p>
                      <Button className="bg-primary hover:bg-primary/80">
                        Leave First Message
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Store Tab */}
            <TabsContent value="store">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="cosmic-card p-6 rounded-xl">
                  <h2 className="text-2xl font-bold font-montserrat mb-4 flex items-center gap-2">
                    <Store size={20} className="text-accent" />
                    Creator Store
                  </h2>
                  
                  {isLoadingStore ? (
                    <div className="text-center py-8 text-foreground/60">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                      Loading store items...
                    </div>
                  ) : storeItems && storeItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {storeItems.map((item: any) => (
                        <Card key={item.id} className="cosmic-card overflow-hidden transition-all duration-300 hover:-translate-y-1">
                          <div className="h-48 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <Store size={48} className="text-foreground/30" />
                            )}
                          </div>
                          <CardHeader>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>
                              ${(item.price / 100).toFixed(2)} · {item.type}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm line-clamp-2">{item.description}</p>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full bg-primary hover:bg-primary/80">
                              Purchase
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 cosmic-card bg-card/30 rounded-xl">
                      <h3 className="text-xl font-semibold mb-2">The Store is Empty</h3>
                      <p className="text-foreground/60 mb-4">This creator hasn't added any items to their cosmic store yet.</p>
                      {userData.username === username && (
                        <Button className="bg-primary hover:bg-primary/80">
                          Add Store Item
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="cosmic-card p-6 rounded-xl">
                  <h2 className="text-2xl font-bold font-montserrat mb-4">Gallery</h2>
                  
                  <div className="text-center py-12 cosmic-card bg-card/30 rounded-xl">
                    <CalendarDays size={48} className="mx-auto mb-4 text-foreground/30" />
                    <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                    <p className="text-foreground/60 mb-4">The creator's cosmic gallery is still being formed in the stars.</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* NFT Tab */}
            <TabsContent value="nft">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="cosmic-card p-6 rounded-xl">
                  <h2 className="text-2xl font-bold font-montserrat mb-4">NFT Showcase</h2>
                  
                  <div className="text-center py-12 cosmic-card bg-card/30 rounded-xl">
                    <MoveDiagonal size={48} className="mx-auto mb-4 text-foreground/30" />
                    <h3 className="text-xl font-semibold mb-2">NFT Showcase Coming Soon</h3>
                    <p className="text-foreground/60 mb-4">This cosmic feature is being prepared for the metaverse.</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ProfilePage;
