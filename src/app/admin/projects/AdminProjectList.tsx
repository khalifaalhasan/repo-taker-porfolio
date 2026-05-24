"use client";
import { useState, useRef } from "react";
import { Project } from "@/data/projects";
import { toggleProjectVisibility, updateProjectImages, uploadImageAction, updateProjectText } from "./actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Check, Upload, Trash, FileText, RefreshCw, Loader2 } from "lucide-react";
import { ImageCropper } from "@/components/admin/ImageCropper";

export function AdminProjectList({ projects }: { projects: (Project & { isHidden: boolean; customImages: string[] })[] }) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingTextSlug, setEditingTextSlug] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingSlugs, setLoadingSlugs] = useState<Set<string>>(new Set());
  
  // Cropper state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
      setCropFileName(file.name);
      e.target.value = ""; // Reset input
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setCropImageSrc(null);
    setIsUploading(true);
    try {
      const { url } = await uploadImageAction(croppedBase64, cropFileName);
      setImageUrls(prev => [...prev, url]);
    } catch (e) {
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleVisibility = async (slug: string, isHidden: boolean) => {
    setLoadingSlugs(prev => new Set(prev).add(slug));
    try {
      await toggleProjectVisibility(slug, isHidden);
    } finally {
      setLoadingSlugs(prev => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  };

  const visibleProjects = projects.filter(p => !p.isHidden);
  const hiddenProjects = projects.filter(p => p.isHidden);

  const ProjectCard = ({ project }: { project: Project & { isHidden: boolean; customImages: string[] } }) => {
    const isToggling = loadingSlugs.has(project.slug);
    return (
      <div className="p-4 border border-border bg-card rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{project.title}</h3>
          <p className="text-sm text-muted-foreground">{project.githubFullName}</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Visibility Toggle */}
          <div className="flex items-center gap-3">
            {isToggling && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
            <span className="text-sm font-medium text-muted-foreground w-16">
              {project.isHidden ? 'Hidden' : 'Visible'}
            </span>
            <Switch 
              checked={!project.isHidden}
              disabled={isToggling}
              onCheckedChange={(checked) => handleToggleVisibility(project.slug, !checked)}
            />
          </div>
          
          {/* Edit Text Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setEditingTextSlug(project.slug);
              setCustomTitle(project.customTitle || project.title);
              setCustomDescription(project.customDescription || project.description || "");
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Edit Text
          </Button>
          
          {/* Edit Photos Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setEditingSlug(project.slug);
              setImageUrls(project.customImages || []);
            }}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Photos
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-secondary/50 h-auto p-1.5 flex flex-wrap max-w-fit rounded-xl border border-border">
          <TabsTrigger value="all" className="rounded-lg px-6 py-2">All Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="visible" className="rounded-lg px-6 py-2">Visible ({visibleProjects.length})</TabsTrigger>
          <TabsTrigger value="hidden" className="rounded-lg px-6 py-2">Hidden ({hiddenProjects.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 outline-none">
          {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </TabsContent>
        
        <TabsContent value="visible" className="space-y-4 outline-none">
          {visibleProjects.length === 0 ? (
             <div className="p-8 text-center border border-border border-dashed rounded-xl text-muted-foreground">No visible projects.</div>
          ) : visibleProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </TabsContent>
        
        <TabsContent value="hidden" className="space-y-4 outline-none">
          {hiddenProjects.length === 0 ? (
             <div className="p-8 text-center border border-border border-dashed rounded-xl text-muted-foreground">No hidden projects.</div>
          ) : hiddenProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </TabsContent>
      </Tabs>

      {/* Edit Text Modal */}
      {editingTextSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card p-6 border border-border rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Edit Project Details</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  setIsSyncing(true);
                  await updateProjectText(editingTextSlug, null, null);
                  setIsSyncing(false);
                  setEditingTextSlug(null);
                }}
                disabled={isSyncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                Sync GitHub
              </Button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Custom Title</label>
                <input 
                  type="text" 
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Custom Overview</label>
                <textarea 
                  className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setEditingTextSlug(null)}>Cancel</Button>
              <Button 
                onClick={async () => {
                  await updateProjectText(editingTextSlug, customTitle, customDescription);
                  setEditingTextSlug(null);
                }}
              >
                <Check className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photos Modal */}
      {editingSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card p-6 border border-border rounded-xl w-full max-w-lg shadow-2xl">
            <h3 className="font-bold text-xl mb-2">Edit Photos</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload a new photo or manage existing ones.</p>
            
            <div className="mb-4 space-y-3 max-h-48 overflow-y-auto pr-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary/50 p-2 rounded-lg border border-border">
                  <img src={url} alt={`Project ${i}`} className="w-16 h-10 object-cover rounded border border-border" />
                  <span className="text-xs truncate flex-1 opacity-70">{url}</span>
                  <Button variant="ghost" size="icon" onClick={() => setImageUrls(urls => urls.filter((_, idx) => idx !== i))}>
                    <Trash className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              
              {imageUrls.length === 0 && (
                <div className="text-sm text-muted-foreground italic py-4 text-center bg-secondary/20 rounded-lg border border-dashed border-border/50">
                  No custom photos yet. Automatic placeholder will be used.
                </div>
              )}
            </div>

            <div className="flex gap-3 mb-6">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
              <Button variant="secondary" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload New Photo"}
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setEditingSlug(null)}>Cancel</Button>
              <Button 
                onClick={async () => {
                  await updateProjectImages(editingSlug, imageUrls);
                  setEditingSlug(null);
                }}
              >
                <Check className="w-4 h-4 mr-2" /> Save Photos
              </Button>
            </div>
          </div>
        </div>
      )}

      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
          aspectRatio={16 / 9}
        />
      )}
    </div>
  );
}
