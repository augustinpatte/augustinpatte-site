from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parents[1]
for name, file in [('Sans', 'DejaVuSans.ttf'), ('SansBold', 'DejaVuSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, '/usr/share/fonts/truetype/dejavu/' + file))
ink, muted, green = [HexColor(c) for c in ['#202b28', '#5b665d', '#244d3e']]
styles = {
    'name': ParagraphStyle('name', fontName='Sans', fontSize=26, leading=31, textColor=ink, spaceAfter=9),
    'sub': ParagraphStyle('sub', fontName='Sans', fontSize=9, leading=14, textColor=green),
    'meta': ParagraphStyle('meta', fontName='Sans', fontSize=7.5, leading=12, textColor=muted),
    'section': ParagraphStyle('section', fontName='SansBold', fontSize=8.3, leading=12, textColor=green, spaceBefore=14, spaceAfter=7),
    'title': ParagraphStyle('title', fontName='SansBold', fontSize=8.6, leading=12, textColor=ink, spaceAfter=3),
    'body': ParagraphStyle('body', fontName='Sans', fontSize=8.25, leading=12, textColor=muted, spaceAfter=4),
}
story = []
def p(text, style='body'):
    return Paragraph(text, styles[style])
def section(title, entries):
    first = True
    for title2, text in entries:
        chunk=[]
        if first: chunk.append(p(title.upper(), 'section')); first=False
        if title2: chunk.append(p(title2,'title'))
        chunk.append(p(text))
        chunk.append(Spacer(1,3))
        story.append(KeepTogether(chunk))

story += [p('Augustin Patte', 'name'),
          p('Finance &amp; Business Analytics double major · Computer Science minor', 'sub'),
          p('New Orleans, United States · From Boulogne-Billancourt, France', 'meta'),
          p('<link href="https://www.linkedin.com/in/augustin-patte-8057ab396" color="#244d3e">LinkedIn</link>  |  <link href="https://augustinpatte.com" color="#244d3e">Portfolio</link>', 'meta')]
section('Profile', [('', 'Student-athlete at Loyola University New Orleans, combining finance, business analytics, programming and AI. Corporate Development experience at IQVIA Operations France, including independent development of an internal CRM prototype. GPA of 3.97/4.00 at Lawrence Technological University.')])
section('Experience', [('IQVIA Operations France · Corporate Development Intern | Summer 2026', 'Supported recurring operational activities and internal projects through data organization, research and information management. Prepared and updated internal materials for follow-up and decision support. Independently designed and built an internal CRM prototype to centralize company and contact information, organize follow-up and improve visibility across ongoing activity. Participated in team and internal meetings.')])
section('Education', [
('Loyola University New Orleans | 2026–present', 'BBA: double major in Finance and Business Analytics; minor in Computer Science. Collegiate tennis.'),
('Lawrence Technological University | 2025–2026', 'Finance and Computer Science coursework. GPA: 3.97/4.00. Dean’s List in both semesters. Collegiate tennis.'),
('Additional study', 'MIT MicroMasters in Finance: levels 1 and 3 completed (2025). Harvard CS50 online: Introduction to Computer Science and Introduction to Artificial Intelligence with Python (2026).'),
('Lycée Notre-Dame de Boulogne | 2025', 'French Baccalaureate with Honors. Specializations: Mathematics, Economics and Social Sciences.')])
section('Projects', [
('PersoNewsAP', 'Bilingual mobile learning app in development: personalized news, business stories, mini cases and key concepts. React Native/Expo, TypeScript and Supabase; content workflows and private iOS testing.'),
('IAProTech · AI Privacy Proxy', 'Built a platform masking sensitive business data before external AI processing and restoring original values in responses, for document analysis and drafting.'),
('Further personal work', 'Automated news analysis newsletter using AI tools and Python; Chess Coach local React prototype; World Rush Football in Godot; AI and media automation experiments.')])
section('Skills & languages', [('', 'Finance and accounting fundamentals, financial analysis, quantitative reasoning and business research. Data: SQL, Excel, Tableau and quality checks. Programming: Python, C, C++, JavaScript, HTML; TypeScript and React through personal projects. Microsoft Word, Excel and PowerPoint.<br/>French: native. English: fluent, used for university studies in the United States.')])
section('Writing & interests', [('', 'Competitive collegiate tennis, coding, artificial intelligence, finance, business, product development and reading. Three sports books published in French and English under the pen name Andrew Pace.')])
path = ROOT / 'dist/assets/Augustin-Patte-Resume.pdf'
doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=43, leftMargin=43, topMargin=34, bottomMargin=30, title='Augustin Patte — Résumé', author='Augustin Patte')
doc.build(story)
print(path)
