const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/authoryn');
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    console.log('Cleared existing database records.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'LeafBlog Curator',
      email: 'admin@authoryn.com',
      username: 'antigravity',
      password: 'password123',
      bio: 'Lead curator at LeafBlog. Crafting premium articles about software development, UI/UX design, and digital minimalism.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: 'admin'
    });

    const regularUser = await User.create({
      name: 'Jane Doe',
      email: 'jane@authoryn.com',
      username: 'janedoe',
      password: 'password123',
      bio: 'Minimalist designer and tech writer. Enthusiastic about clean lines, typography, and robust software architecture.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      role: 'user'
    });

    console.log('Seed: Created 2 users (admin, regular).');

    // 2. Create 6 Posts
    const postsData = [
      {
        title: 'The Gravity of Code: Writing Clean Software',
        content: `
          <p>Software development is often treated as a pure science, a mathematical construct of variables and loops. But when we look closer, writing code has more in common with editorial craftsmanship than we think. Every line of code is an expression of intent. Clean code doesn't just run; it communicates.</p>
          <h2>The Craft of Readability</h2>
          <p>We read code far more often than we write it. When you return to a function six months later, you aren't just reading instructions for a CPU—you are reading your own past thoughts. Writing clean software means stripping away the weight, the overhead, the gravity of unnecessary complexity. Just like editing a sentence in a magazine, if a block of code doesn't serve a clear purpose, it should be deleted.</p>
          <pre><code>const simplify = (complexity) => {
  return complexity.filter(concept => concept.isEssential);
};</code></pre>
          <h2>The Anti-Template Movement</h2>
          <p>Modern developers are flooded with boilerplates and cookie-cutter frameworks. While they speed up implementation, they often dilute the essence. A project should feel intentional. Every file, route, and function should look handcrafted, written with focus. When you write code that defies gravity, you write code that is light, adaptable, and a joy to read.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        category: 'Development',
        tags: ['development', 'clean-code'],
        author: adminUser._id,
        viewCount: 145,
        status: 'published',
        likes: [regularUser._id]
      },
      {
        title: 'Architecting Minimalist Web Environments',
        content: `
          <p>The web is too loud. Popups, trackers, banners, and auto-playing media have turned the simple act of reading into an obstacle course. Minimalist web environments are not just a stylistic preference; they are an act of rebellion against the attention economy.</p>
          <h2>Designing for Focus</h2>
          <p>To design a web layout that breathes, we must treat empty space not as blank space, but as a primary structural element. White space acts as the frame. It isolates the words, giving them weight. When we strip away sidebar ads, sticky widget rows, and glowing card shadows, what remains is the core experience: the relationship between the author and the reader.</p>
          <blockquote>"Simplicity is not the absence of clutter, but the presence of clarity."</blockquote>
          <p>By centering the content column at a readable 720px width and keeping font sizes generous, we restore reading comfort. The focus shifts back to the content, letting the message shine without distraction.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        category: 'Design',
        tags: ['design', 'minimalism'],
        author: adminUser._id,
        viewCount: 98,
        status: 'published',
        likes: []
      },
      {
        title: 'The Asymmetry of Editorial Layouts',
        content: `
          <p>Standard card grids are boring. Look at almost any modern blogging platform, and you will see the exact same layout: a three-column card grid, a stock image on top, a title, a short snippet, repeat. It is a visual template designed for database efficiency, not reader delight.</p>
          <h2>The Appeal of Asymmetric Design</h2>
          <p>Editorial print magazines like <i>The New Yorker</i> or <i>Apartamento</i> have long understood the power of asymmetry. By placing titles on the left and stacking metadata (author, date, read time) on the right, we break the visual rhythm. The eye is forced to pause and process, rather than scan and skip.</p>
          <p>Asymmetric design creates a dynamic tension on the page. It makes the site feel alive, handmade, and editorial. Rather than grouping items into boxes, let the text speak for itself. Separate sections with thin, borderless rules. Let the elements breathe.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        category: 'Design',
        tags: ['design', 'editorial'],
        author: regularUser._id,
        viewCount: 230,
        status: 'published',
        likes: [adminUser._id]
      },
      {
        title: 'Fraunces vs. Inter: Typography as Voice',
        content: `
          <p>A font is not just letters; it is a tone of voice. When a user lands on a webpage, they hear the typography before they read the actual content. Combining typefaces is a delicate art form.</p>
          <h2>Serifs for Reading, Sans-Serifs for Interface</h2>
          <p>For Authoryn, we combine <b>Inter</b> and <b>Fraunces</b>. Inter is a hyper-functional, clean, and highly readable sans-serif designed for user interfaces. It handles buttons, search bars, tags, and settings panels with quiet precision. It stays in the background, serving the layout.</p>
          <p>Fraunces, on the other hand, is a high-contrast editorial serif. It has soft curves, vintage book-like qualities, and a strong personality. When applied to headers and long-form body text, it invites the reader to slow down. It turns a blog post into an editorial essay, signaling that the writing is intended to be savored.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
        category: 'Design',
        tags: ['design', 'typography'],
        author: regularUser._id,
        viewCount: 310,
        status: 'published',
        likes: [adminUser._id, regularUser._id]
      },
      {
        title: 'The Slow Reading Movement in a Fast Digital Age',
        content: `
          <p>We are skimming everything. In a world of 280-character tweets, 15-second videos, and infinite vertical scroll, our attention spans have been fragmented. We consume content like fast food—quickly, constantly, and without digestion.</p>
          <h2>The Slow Reading Philosophy</h2>
          <p>The Slow Reading Movement is a conscious decision to step away from the firehose of information. It is the practice of reading deeply, analyzing arguments, and enjoying the rhythm of prose. To support slow reading, platforms must change. They must remove notifications, recommended widget sidebars, and infinite auto-plays.</p>
          <p>By providing a clean, quiet space, we give readers permission to pause. A single 720px column of text, a larger 19px body font, and generous 1.85 line height create a restful visual environment. It is an invitation to stay for a while, to think, and to engage.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=1200&q=80',
        category: 'Culture',
        tags: ['culture', 'minimalism'],
        author: adminUser._id,
        viewCount: 84,
        status: 'published',
        likes: []
      },
      {
        title: 'Minimalism Beyond the Visual Grid',
        content: `
          <p>Minimalism is often misunderstood as an aesthetic style—white walls, expensive furniture, and empty spaces. But true minimalism is not about owning nothing; it is about making room for what matters.</p>
          <h2>Living with Intention</h2>
          <p>When applied to our digital and personal lives, minimalism means auditing our attention. What newsletters do you actually read? What communities actually enrich your life? By eliminating the noise, we create space for focus. In design, writing, and living, minimalism is not subtraction for the sake of emptiness—it is subtraction for the sake of clarity.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
        category: 'Culture',
        tags: ['culture', 'minimalism'],
        author: regularUser._id,
        viewCount: 175,
        status: 'published',
        likes: [adminUser._id]
      }
    ];

    const posts = await Post.create(postsData);
    console.log(`Seed: Created ${posts.length} published posts.`);

    // 3. Create 4 Comments
    const commentsData = [
      {
        post: posts[0]._id, // The Gravity of Code
        user: regularUser._id, // Jane Doe
        text: 'This is a great write-up on software craftsmanship. Less is truly more when it comes to code architecture and maintaining logic.'
      },
      {
        post: posts[0]._id, // The Gravity of Code
        user: adminUser._id, // Antigravity Admin
        text: 'Thank you Jane! Glad you found the gravity analogy resonant. Writing clean systems is a constant editing process.'
      },
      {
        post: posts[2]._id, // The Asymmetry of Editorial Layouts
        user: adminUser._id, // Antigravity Admin
        text: 'I absolutely love the asymmetric layout of this platform. It feels like flipping through a premium printed magazine rather than checking a database list.'
      },
      {
        post: posts[3]._id, // Fraunces vs. Inter
        user: regularUser._id, // Jane Doe
        text: 'Using a high-contrast serif typeface makes such a difference in reading comfort. It naturally tells the brain to slow down and absorb the words.'
      }
    ];

    await Comment.create(commentsData);
    console.log('Seed: Created 4 comments across posts.');

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
