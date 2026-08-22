# tools/office_tools.py - Word & PowerPoint Automation

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pptx import Presentation
from pptx.util import Inches as PptInches, Pt as PptPt
from core.session_state import set_last_file
import os

# ===== WORD AUTOMATION =====
def create_formatted_word(path, content, style="professional"):
    """
    Create formatted Word document
    style: professional, academic, creative
    """
    doc = Document()
    
    # Add title
    title = doc.add_heading('VENOM AI Generated Document', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add content paragraphs
    paragraphs = content.split('\n\n')
    
    for para_text in paragraphs:
        if para_text.strip():
            para = doc.add_paragraph(para_text.strip())
            para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            
            # Format based on style
            for run in para.runs:
                run.font.name = 'Calibri'
                run.font.size = Pt(12)
    
    # Add page numbers
    section = doc.sections[0]
    footer = section.footer
    footer_para = footer.paragraphs[0]
    footer_para.text = "Page "
    footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add border to page
    if style == "professional":
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
    
    doc.save(path)
    set_last_file(path)
    return f"Formatted Word document created: {path}"

# ===== POWERPOINT AUTOMATION =====
def create_powerpoint(path, slides_data):
    """
    Create PowerPoint presentation
    slides_data: [
        {"title": "Slide 1", "content": "Bullet points here"},
        {"title": "Slide 2", "content": "More content"}
    ]
    """
    prs = Presentation()
    prs.slide_width = PptInches(10)
    prs.slide_height = PptInches(7.5)
    
    # Title slide
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    
    title.text = slides_data[0].get("title", "Presentation Title")
    subtitle.text = "Created by VENOM AI"
    
    # Content slides
    for slide_data in slides_data[1:]:
        bullet_slide_layout = prs.slide_layouts[1]
        slide = prs.slides.add_slide(bullet_slide_layout)
        
        shapes = slide.shapes
        title_shape = shapes.title
        body_shape = shapes.placeholders[1]
        
        title_shape.text = slide_data.get("title", "Untitled")
        
        tf = body_shape.text_frame
        content = slide_data.get("content", "")
        
        # Add bullet points
        bullets = content.split('\n')
        for i, bullet in enumerate(bullets):
            if bullet.strip():
                if i == 0:
                    tf.text = bullet.strip()
                else:
                    p = tf.add_paragraph()
                    p.text = bullet.strip()
                    p.level = 0
    
    prs.save(path)
    set_last_file(path)
    return f"PowerPoint created: {path}"