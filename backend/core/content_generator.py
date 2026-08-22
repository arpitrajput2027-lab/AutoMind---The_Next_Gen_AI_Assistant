# core/content_generator.py - Content Generation Helper

def generate_essay(topic, min_words=150):
    """
    Generate essay-style content
    This is a fallback if LLM fails
    """
    
    prompts = {
        "machine learning": """Machine Learning: Transforming Technology

Machine Learning (ML) is a revolutionary branch of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It has become an integral part of modern technology, driving innovations across various industries.

The core principle of machine learning involves feeding large amounts of data into algorithms, which then identify patterns and make decisions with minimal human intervention. There are three primary types: supervised learning (using labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error).

Applications of ML are ubiquitous in our daily lives. Recommendation systems on Netflix and Amazon, voice assistants like Siri and Alexa, fraud detection in banking, medical diagnosis, autonomous vehicles, and personalized advertising all rely on machine learning algorithms.

Despite its benefits, ML faces challenges including data privacy concerns, algorithmic bias, the need for massive datasets, and high computational requirements. As the technology evolves, addressing these ethical and practical considerations becomes crucial.

The future of machine learning is promising, with advancements in deep learning, neural networks, and quantum computing opening new possibilities for solving complex problems and improving human lives.""",

        "artificial intelligence": """Artificial Intelligence: The Future of Technology

Artificial Intelligence (AI) represents the simulation of human intelligence processes by machines, particularly computer systems. These processes include learning, reasoning, problem-solving, perception, and language understanding.

AI can be categorized into narrow AI, designed for specific tasks, and general AI, which would possess human-like intelligence across various domains. Current AI systems fall into the narrow category, excelling at specific tasks like image recognition, language translation, or game playing.

The impact of AI spans multiple sectors. In healthcare, AI assists in disease diagnosis and drug discovery. In finance, it powers algorithmic trading and fraud detection. Transportation is being revolutionized by autonomous vehicles, while customer service benefits from intelligent chatbots.

However, AI development raises important ethical questions about job displacement, privacy, decision-making transparency, and potential misuse. Ensuring responsible AI development requires careful consideration of these challenges and implementation of appropriate safeguards.

As AI continues to advance, it promises to solve complex global challenges in climate change, healthcare, education, and beyond, potentially ushering in a new era of human progress.""",

        "climate change": """Climate Change: A Global Emergency

Climate change refers to long-term shifts in global temperatures and weather patterns, primarily driven by human activities since the industrial revolution. It represents one of the most critical challenges facing our planet today.

The primary cause is the accumulation of greenhouse gases in the atmosphere, particularly carbon dioxide from burning fossil fuels, deforestation, and industrial processes. These gases trap heat, leading to global warming and disrupting Earth's climate systems.

The effects are already visible and severe. Rising sea levels threaten coastal communities, extreme weather events are becoming more frequent and intense, ecosystems are being disrupted, and biodiversity is declining. Agricultural patterns are shifting, threatening food security worldwide.

Solutions require immediate and coordinated global action. Transitioning to renewable energy sources, improving energy efficiency, protecting and restoring forests, developing sustainable transportation, and implementing carbon capture technologies are essential steps.

Individual actions also matter: reducing consumption, choosing sustainable products, supporting clean energy, and advocating for climate policies. The Paris Agreement and other international frameworks provide hope, but success depends on swift, decisive implementation of climate solutions."""
    }
    
    # Return specific content or generate generic
    topic_lower = topic.lower()
    for key, content in prompts.items():
        if key in topic_lower:
            return content
    
    # Generic template
    return f"""{topic.title()}: An Overview

{topic.title()} is an important subject that deserves careful examination. This document provides a comprehensive overview of the key aspects and considerations.

Introduction
Understanding {topic} requires examining its fundamental principles, applications, and impact on society. Various factors contribute to its significance in today's world.

Key Points
Several important aspects define {topic}. First, its theoretical foundation provides the framework for understanding. Second, practical applications demonstrate real-world relevance. Third, ongoing developments continue to shape its evolution.

Applications
The practical applications of {topic} span multiple domains and industries. These implementations showcase the versatility and utility of the concepts involved.

Challenges
Like any significant area of study, {topic} faces various challenges. Addressing these obstacles requires innovation, collaboration, and sustained effort from stakeholders.

Conclusion
{topic} represents an important area worthy of continued study and development. As we move forward, understanding these concepts becomes increasingly valuable for both individuals and society."""

def suggest_content_length(content_type):
    """Suggest appropriate word count"""
    suggestions = {
        "essay": (200, 500),
        "paragraph": (100, 200),
        "summary": (50, 100),
        "report": (300, 1000),
        "article": (400, 800)
    }
    return suggestions.get(content_type, (150, 300))