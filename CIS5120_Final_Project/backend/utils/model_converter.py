"""
Utility module for converting 3D model files to GLTF/GLB format.
Supports STEP, STP, SLDPRT, and other CAD formats.
"""
import os
import pathlib
import hashlib
import trimesh
import time
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# Supported input formats
SUPPORTED_FORMATS = {'.step', '.stp', '.stl', '.obj', '.ply', '.off', '.dae', '.3mf', '.sldprt'}

class ModelConverter:
    """Handles conversion of 3D model files to GLTF format with caching."""
    
    def __init__(self, asset_root: pathlib.Path, cache_root: pathlib.Path, cache_ttl_hours: int = 24):
        """
        Initialize the model converter.
        
        Args:
            asset_root: Root directory containing source model files
            cache_root: Directory for storing converted GLTF files
            cache_ttl_hours: Time to live for cached files in hours (default: 24)
        """
        self.asset_root = asset_root
        self.cache_root = cache_root
        self.cache_ttl_hours = cache_ttl_hours
        self.cache_root.mkdir(parents=True, exist_ok=True)
    
    def _get_cache_path(self, source_path: pathlib.Path, output_format: str = 'glb') -> pathlib.Path:
        """
        Generate a cache file path for a given source file.
        
        Args:
            source_path: Path to the source model file
            output_format: Output format ('glb' or 'gltf')
        
        Returns:
            Path to the cached file
        """
        # Create a hash of the file path for unique identification
        path_hash = hashlib.md5(str(source_path).encode()).hexdigest()
        return self.cache_root / f"{path_hash}.{output_format}"
    
    def _is_cache_valid(self, source_path: pathlib.Path, cache_path: pathlib.Path) -> bool:
        """
        Check if cached file exists, is newer than source, and hasn't expired.
        
        Args:
            source_path: Path to source file
            cache_path: Path to cached file
        
        Returns:
            True if cache is valid, False otherwise
        """
        if not cache_path.exists():
            return False
        
        # Check if cache has expired based on TTL
        cache_mtime = cache_path.stat().st_mtime
        current_time = time.time()
        cache_age_hours = (current_time - cache_mtime) / 3600
        
        if cache_age_hours > self.cache_ttl_hours:
            logger.info(f"Cache expired for {cache_path.name} (age: {cache_age_hours:.1f}h)")
            return False
        
        # Check if source file is newer than cache
        source_mtime = source_path.stat().st_mtime
        return cache_mtime >= source_mtime
    
    def convert_to_gltf(
        self, 
        source_path: pathlib.Path, 
        output_format: str = 'glb',
        force_reconvert: bool = False
    ) -> Optional[pathlib.Path]:
        """
        Convert a 3D model file to GLTF/GLB format.
        
        Args:
            source_path: Path to the source model file
            output_format: Output format ('glb' for binary, 'gltf' for JSON)
            force_reconvert: If True, ignore cache and reconvert
        
        Returns:
            Path to the converted file, or None if conversion failed
        """
        if not source_path.exists():
            logger.error(f"Source file not found: {source_path}")
            return None
        
        # Check file extension
        file_ext = source_path.suffix.lower()
        if file_ext not in SUPPORTED_FORMATS:
            logger.warning(f"Unsupported format: {file_ext}")
            return None
        
        # Check cache
        cache_path = self._get_cache_path(source_path, output_format)
        if not force_reconvert and self._is_cache_valid(source_path, cache_path):
            logger.info(f"Using cached file: {cache_path}")
            return cache_path
        
        try:
            logger.info(f"Converting {source_path} to {output_format.upper()}")
            
            # Load the mesh using trimesh
            # Trimesh supports STEP/STP files through pythonocc or other backends
            mesh = trimesh.load(str(source_path), force='mesh')
            
            # If it's a Scene, export the whole scene
            if isinstance(mesh, trimesh.Scene):
                # Export scene to GLTF/GLB
                with open(cache_path, 'wb') as f:
                    f.write(trimesh.exchange.gltf.export_gltf(mesh, include_normals=True))
            else:
                # Single mesh export
                mesh.export(str(cache_path), file_type=output_format)
            
            logger.info(f"Successfully converted to: {cache_path}")
            return cache_path
            
        except Exception as e:
            logger.error(f"Failed to convert {source_path}: {str(e)}")
            # Try alternative conversion method for STEP files
            if file_ext in {'.step', '.stp', '.sldprt'}:
                return self._convert_step_alternative(source_path, cache_path, output_format)
            return None
    
    def _convert_step_alternative(
        self, 
        source_path: pathlib.Path, 
        cache_path: pathlib.Path,
        output_format: str
    ) -> Optional[pathlib.Path]:
        """
        Alternative conversion method for STEP files using external tools if available.
        
        Args:
            source_path: Path to source STEP file
            cache_path: Path to output cache file
            output_format: Output format
        
        Returns:
            Path to converted file or None
        """
        try:
            # Try using FreeCAD if available (requires freecad package)
            import subprocess
            
            # Check if freecad is available
            result = subprocess.run(['which', 'freecad'], capture_output=True)
            if result.returncode != 0:
                logger.warning("FreeCAD not found, STEP conversion may be limited")
                return None
            
            # Create a temporary Python script for FreeCAD to execute
            temp_script = cache_path.parent / f"convert_{cache_path.stem}.py"
            with open(temp_script, 'w') as f:
                f.write(f"""
import FreeCAD
import Mesh
import ImportGui

# Load STEP file
ImportGui.insert("{source_path}", "Unnamed")

# Get all objects
objs = FreeCAD.ActiveDocument.Objects

# Export to mesh format (STL first, then convert to GLTF)
temp_stl = "{cache_path.with_suffix('.stl')}"
Mesh.export(objs, temp_stl)
""")
            
            # Run FreeCAD in console mode
            subprocess.run([
                'freecad', '-c', str(temp_script)
            ], capture_output=True, timeout=30)
            
            # Now convert STL to GLTF using trimesh
            stl_path = cache_path.with_suffix('.stl')
            if stl_path.exists():
                mesh = trimesh.load(str(stl_path))
                mesh.export(str(cache_path), file_type=output_format)
                stl_path.unlink()  # Clean up temporary STL
                temp_script.unlink()  # Clean up script
                return cache_path
            
            temp_script.unlink()  # Clean up script
            return None
            
        except Exception as e:
            logger.error(f"Alternative STEP conversion failed: {str(e)}")
            return None
    
    def get_model_path(self, category: str, filename: str) -> Optional[pathlib.Path]:
        """
        Get the full path to a model file in the assets directory.
        
        Args:
            category: Component category (e.g., 'motors', 'frames')
            filename: Model filename
        
        Returns:
            Full path to the model file or None if not found
        """
        model_path = self.asset_root / category / filename
        if model_path.exists():
            return model_path
        return None
    
    def convert_component_model(
        self, 
        category: str, 
        filename: str,
        output_format: str = 'glb'
    ) -> Tuple[Optional[pathlib.Path], Optional[str]]:
        """
        Convert a component model to GLTF format.
        
        Args:
            category: Component category
            filename: Model filename
            output_format: Output format ('glb' or 'gltf')
        
        Returns:
            Tuple of (converted_path, error_message)
        """
        source_path = self.get_model_path(category, filename)
        if not source_path:
            return None, f"Model file not found: {category}/{filename}"
        
        converted_path = self.convert_to_gltf(source_path, output_format)
        if not converted_path:
            return None, f"Failed to convert model: {category}/{filename}"
        
        return converted_path, None
    
    def cleanup_expired_cache(self) -> int:
        """
        Remove expired cached files based on TTL.
        
        Returns:
            Number of files deleted
        """
        if not self.cache_root.exists():
            return 0
        
        deleted_count = 0
        current_time = time.time()
        ttl_seconds = self.cache_ttl_hours * 3600
        
        for cache_file in self.cache_root.iterdir():
            if cache_file.is_file():
                file_age_seconds = current_time - cache_file.stat().st_mtime
                if file_age_seconds > ttl_seconds:
                    try:
                        cache_file.unlink()
                        deleted_count += 1
                        logger.info(f"Deleted expired cache file: {cache_file.name}")
                    except Exception as e:
                        logger.error(f"Failed to delete cache file {cache_file.name}: {e}")
        
        logger.info(f"Cache cleanup completed: {deleted_count} files deleted")
        return deleted_count
    
    def clear_all_cache(self) -> int:
        """
        Remove all cached files.
        
        Returns:
            Number of files deleted
        """
        if not self.cache_root.exists():
            return 0
        
        deleted_count = 0
        for cache_file in self.cache_root.iterdir():
            if cache_file.is_file():
                try:
                    cache_file.unlink()
                    deleted_count += 1
                except Exception as e:
                    logger.error(f"Failed to delete cache file {cache_file.name}: {e}")
        
        logger.info(f"Cache cleared: {deleted_count} files deleted")
        return deleted_count
    
    def get_cache_stats(self) -> dict:
        """
        Get statistics about the cache directory.
        
        Returns:
            Dictionary with cache statistics
        """
        if not self.cache_root.exists():
            return {"total_files": 0, "total_size_mb": 0, "expired_files": 0}
        
        total_files = 0
        total_size = 0
        expired_files = 0
        current_time = time.time()
        ttl_seconds = self.cache_ttl_hours * 3600
        
        for cache_file in self.cache_root.iterdir():
            if cache_file.is_file():
                total_files += 1
                total_size += cache_file.stat().st_size
                file_age_seconds = current_time - cache_file.stat().st_mtime
                if file_age_seconds > ttl_seconds:
                    expired_files += 1
        
        return {
            "total_files": total_files,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "expired_files": expired_files,
            "cache_ttl_hours": self.cache_ttl_hours
        }

