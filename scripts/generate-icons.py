#!/usr/bin/env python3
"""
Icon generator for Brush Chrome Extension
Creates PNG icons from the SVG template
"""

import os

def generate_icons():
    """Generate icons from SVG template"""
    
    # Check available tools
    tool = None
    
    # Try ImageMagick
    if os.system("which magick > /dev/null 2>&1") == 0:
        tool = "magick"
    elif os.system("which convert > /dev/null 2>&1") == 0:
        tool = "convert"
    
    # Try inkscape
    if not tool and os.system("which inkscape > /dev/null 2>&1") == 0:
        tool = "inkscape"
    
    # Try rsvg-convert
    if not tool and os.system("which rsvg-convert > /dev/null 2>&1") == 0:
        tool = "rsvg"
    
    svg_file = "icons/icon.svg"
    sizes = [16, 32, 48, 128]
    
    if tool == "inkscape":
        for size in sizes:
            cmd = f"inkscape -w {size} -h {size} -o icons/icon{size}.png {svg_file}"
            os.system(cmd)
        print(f"Icons generated using Inkscape")
        return True
    
    elif tool in ["magick", "convert"]:
        for size in sizes:
            cmd = f"{tool} -resize {size}x{size} {svg_file} icons/icon{size}.png"
            os.system(cmd)
        print(f"Icons generated using ImageMagick")
        return True
    
    elif tool == "rsvg":
        for size in sizes:
            cmd = f"rsvg-convert -w {size} -h {size} -o icons/icon{size}.png {svg_file}"
            os.system(cmd)
        print(f"Icons generated using rsvg-convert")
        return True
    
    else:
        print("No icon generation tool found.")
        print("Please install one of:")
        print("  - ImageMagick: sudo apt-get install imagemagick")
        print("  - Inkscape: sudo apt-get install inkscape")
        print("  - librsvg: sudo apt-get install librsvg2-bin")
        print("\nOr manually:")
        print("1. Open icons/icon.svg in a graphics editor")
        print("2. Export as PNG at 16, 32, 48, and 128 pixels")
        return False

if __name__ == "__main__":
    os.chdir("../")
    generate_icons()