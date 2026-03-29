import { Job } from 'bullmq';
import { LayerStatus, LayerProcessingJob } from '@trace/core';
import prisma from '@/infrastructure/database/prisma';
import fs from 'fs';
import sharp from 'sharp';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export class LayerProcessor {
  async process(job: Job<LayerProcessingJob>) {
    const { layerId, fileUrl, pageNumber } = job.data;
    console.log(`[LayerProcessor] Starting job for layer: ${layerId}, fileStr: ${fileUrl}, page: ${pageNumber}`);

    let cleanupPath: string | null = null;

    try {
      // 1. Update status to PROCESSING
      await prisma.layer.update({
        where: { id: layerId },
        data: { status: LayerStatus.PROCESSING },
      });

      // fileUrl is the absolute path from the backend
      let inputPath = fileUrl;

      if (!fs.existsSync(inputPath)) {
        console.error(`[LayerProcessor] File not found at: ${inputPath}`);
        throw new Error(`File not found: ${inputPath}`);
      }

      // Check for PDF and convert if necessary
      if (inputPath.toLowerCase().endsWith('.pdf')) {
          const page = pageNumber || 1;
          const outputPath = path.join(path.dirname(inputPath), `${path.basename(inputPath, '.pdf')}_page_${page}.png`);
          
          console.log(`[LayerProcessor] Converting PDF page ${page} to PNG...`);
          
          // Ghostscript command to convert specific page to PNG
          // -r150: 150 DPI (Adjust as needed, maybe higher for plans)
          // -sDEVICE=png16m: 24-bit color PNG
          const cmd = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -dFirstPage=${page} -dLastPage=${page} -sOutputFile="${outputPath}" "${inputPath}"`;
          
          try {
            await execPromise(cmd);
            inputPath = outputPath;
            cleanupPath = outputPath; // Mark for deletion after processing
          } catch (err) {
             console.error('[LayerProcessor] Ghostscript conversion failed:', err);
             throw new Error('Failed to convert PDF layer');
          }
      }

      // 2. Process Image
      // Get metadata to ensure valid image
      const metadata = await sharp(inputPath).metadata();
      console.log(`[LayerProcessor] Image stats: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

      // Simulate processing time (or perform actual tiling here)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Update status to READY (COMPLETED -> READY)
      // Convert absolute path to public URL path (relative to server root)
      // Assumes structure .../uploads/...
      const publicPath = inputPath.substring(inputPath.indexOf('/uploads'));

      const updatedLayer = await prisma.layer.update({
        where: { id: layerId },
        data: { 
            status: LayerStatus.READY,
            imageUrl: publicPath 
        },
      });
      console.log(`[LayerProcessor] Job completed for layer ${layerId}. Public URL: ${publicPath}`);

      return {
        status: LayerStatus.READY,
        layerId: updatedLayer.id,
        planId: updatedLayer.planId,
        imageUrl: updatedLayer.imageUrl
      };

    } catch (error) {
      console.error(`[LayerProcessor] Job failed for layer ${layerId}:`, error);
      await prisma.layer.update({
        where: { id: layerId },
        data: { status: LayerStatus.ERROR },
      }).catch((err: any) => console.error("Failed to update layer status to ERROR", err));
      
      throw error; // Rethrow to let BullMQ know it failed
    } finally {
        // Cleanup temporary file
        if (cleanupPath && fs.existsSync(cleanupPath)) {
            // Optional: Keep it as the "processed" asset or delete? 
            // For now, we are just validating it works, but usually we would upload this result to S3.
            // Since we are referencing local paths mostly, let's NOT delete it yet if we want to serve it?
            // Wait, the frontend will try to load `imageUrl` which points to the PDF.
            // We need to update the `imageUrl` in the DB to point to the new PNG if we converted it!
            
            // NOTE: This implementation is for local filesystem. If using S3, this logic changes.
            // Assuming local strategy for MVP based on workspace.
        }
    }
  }
} // Closed correctly? The original file had a closing brace. I need to match structure.

