"use client";
import { useState } from 'react';
import { Modal, Button, TextField, Label, Input, Description, FieldError, TextArea } from '@heroui/react';
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import toast from 'react-hot-toast';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess: () => void;
}

export function ProductFormModal({ isOpen, onClose, product, onSuccess }: ProductFormModalProps) {
  const { store } = useStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!store) return;

    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      // Create/Update Product
      const productData = {
        store_id: store.id,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        promotional_price: formData.get('promotional_price') 
          ? parseFloat(formData.get('promotional_price') as string) 
          : null,
        available: true,
        featured: false,
      };

      let productId = product?.id;

      if (product) {
        // Update
        const { error } = await supabase
          .schema('catalog')
          .from('products')
          .update(productData)
          .eq('id', product.id);
        
        if (error) throw error;
      } else {
        // Create
        const { data, error } = await supabase
          .schema('catalog')
          .from('products')
          .insert(productData)
          .select()
          .single();
        
        if (error) throw error;
        productId = data.id;
      }

      // Upload Images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${i}.${fileExt}`;
          const filePath = `stores/${store.id}/${fileName}`;

          // Upload to Storage
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get Public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          // Save to product_images table
          await supabase
            .schema('catalog')
            .from('product_images')
            .insert({
              product_id: productId,
              storage_path: filePath,
              url: publicUrl,
              is_primary: i === 0,
              sort_order: i,
            });
        }
      }

      toast.success(product ? 'Produto atualizado!' : 'Produto criado!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container placement="center" scroll="inside">
        <Modal.Dialog className="sm:max-w-2xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{product ? 'Editar Produto' : 'Novo Produto'}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
              <TextField isRequired name="name" type="text" defaultValue={product?.name}>
                <Label>Nome do Produto</Label>
                <Input placeholder="Ex: Pizza Margherita" />
                <FieldError />
              </TextField>

              <TextField name="description" defaultValue={product?.description}>
                <Label>Descrição</Label>
                <TextArea placeholder="Descreva o produto..." rows={3} />
              </TextField>

              <div className="grid grid-cols-2 gap-4">
                <TextField isRequired name="price" type="number" step="0.01" defaultValue={product?.price}>
                  <Label>Preço (R$)</Label>
                  <Input placeholder="0.00" />
                  <FieldError />
                </TextField>

                <TextField name="promotional_price" type="number" step="0.01" defaultValue={product?.promotional_price}>
                  <Label>Preço Promocional (R$)</Label>
                  <Input placeholder="0.00" />
                </TextField>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <Label>Imagens do Produto</Label>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Preview ${index}`} className="h-24 w-24 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50">
                    <Upload size={24} className="text-gray-400" />
                    <span className="mt-1 text-xs text-gray-500">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <Description>Adicione até 5 imagens. A primeira será a imagem principal.</Description>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" form="product-form" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
