/**
 * Builds platform knowledge for the StudyNotion chatbot (categories, prices, top courses, UI guide).
 * Used as context for the LLM so users can ask about courses, categories, pricing, and navigation.
 */
const Course = require("../models/Course");
const Category = require("../models/Category");

async function buildKnowledgeBase() {
  try {
    const [categories, courses] = await Promise.all([
      Category.find().select("name description").lean(),
      Course.find({ status: "Published" })
        .select("courseName price category studentsEnroled ratingAndReviews")
        .populate("category", "name")
        .lean(),
    ]);

    const categoryNames = categories.map((c) => c.name).filter(Boolean);
    const categoryList =
      categoryNames.length > 0
        ? categoryNames.join(", ")
        : "No categories yet.";

    const prices = courses.map((c) => Number(c.price)).filter((p) => !isNaN(p) && p >= 0);
    const lowestPrice =
      prices.length > 0 ? Math.min(...prices) : null;
    const highestPrice =
      prices.length > 0 ? Math.max(...prices) : null;
    const priceRange =
      lowestPrice != null && highestPrice != null
        ? `₹${lowestPrice} to ₹${highestPrice}`
        : "No published courses yet.";

    // Top courses by enrollment count (studentsEnroled length)
    const withEnrollment = courses
      .map((c) => ({
        name: c.courseName,
        count: Array.isArray(c.studentsEnroled) ? c.studentsEnroled.length : 0,
        price: c.price,
        category: c.category?.name,
      }))
      .filter((c) => c.name);
    const topCourses = withEnrollment
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((c) => `${c.name} (${c.count} enrolled, ₹${c.price})`)
      .join("; ");

    const courseNamesList =
      courses.length > 0
        ? courses
            .slice(0, 20)
            .map((c) => c.courseName)
            .filter(Boolean)
            .join(", ")
        : "No published courses yet.";

    return {
      categoryList,
      priceRange,
      lowestPrice: lowestPrice != null ? `₹${lowestPrice}` : null,
      highestPrice: highestPrice != null ? `₹${highestPrice}` : null,
      topCourses: topCourses || "No enrollment data yet.",
      courseNamesList,
      totalCourses: courses.length,
      totalCategories: categories.length,
    };
  } catch (err) {
    console.error("Knowledge base build error:", err.message);
    return {
      categoryList: "Unable to load.",
      priceRange: "Unable to load.",
      lowestPrice: null,
      highestPrice: null,
      topCourses: "Unable to load.",
      courseNamesList: "Unable to load.",
      totalCourses: 0,
      totalCategories: 0,
    };
  }
}

function getSystemPrompt(knowledge) {
  return `You are the friendly StudyNotion assistant. StudyNotion is an online learning platform (ed-tech) that helps users learn coding and technical skills through structured courses. You help visitors and students with course discovery, pricing, categories, and how to use the platform.

## What StudyNotion solves
- Makes quality coding education accessible online: learn at your own pace, from anywhere.
- Connects students with instructor-led courses, hands-on projects, and feedback.
- Offers a clear path from beginner to advanced with categorized courses and a simple UI.

## Platform knowledge (use this to answer accurately)
- **Course categories:** ${knowledge.categoryList}
- **Price range:** ${knowledge.priceRange}
- **Lowest course price:** ${knowledge.lowestPrice || "N/A"}
- **Highest course price:** ${knowledge.highestPrice || "N/A"}
- **Popular / best-enrolled courses:** ${knowledge.topCourses}
- **Sample course names:** ${knowledge.courseNamesList}
- **Total published courses:** ${knowledge.totalCourses}
- **Total categories:** ${knowledge.totalCategories}

## UI and navigation guide
- **Home:** Landing page with highlights, CTA to sign up, and course overview.
- **Catalog:** Browse courses by category; each category shows its courses.
- **About Us:** Company story and mission (driving innovation in online education).
- **Contact Us:** Page to reach support or send inquiries.
- **Sign up / Login:** Top-right; users can register as Student or Instructor.
- **Dashboard (after login):** Students see profile, enrolled courses, cart; Instructors see dashboard, my courses, add/edit course.
- **Course details:** Each course has description, price, instructor, what you'll learn; students can enroll or add to cart.
- No login is required to browse the catalog or use this chat.

Answer in a helpful, concise way. If asked about courses, categories, or prices, use the platform knowledge above. If something is not in the knowledge, say you don't have that information and suggest they check the Catalog or Contact Us. Keep replies focused and friendly.`;
}

module.exports = { buildKnowledgeBase, getSystemPrompt };
