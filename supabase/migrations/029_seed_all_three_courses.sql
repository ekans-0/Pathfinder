-- Seed all three courses with complete content from PDF
-- Using proper UUID generation

-- Course 1: Legal Rights & Self-Advocacy
WITH course1 AS (
  INSERT INTO courses (title, description, easy_read_description, order_index, is_published) 
  VALUES (
    'Legal Rights & Self-Advocacy', 
    'Learn about your rights under ADA, IDEA, Section 504, and Fair Housing Act. Understand how to advocate for yourself in school, work, housing, and public spaces.',
    'Learn about your rights. Understand the laws that protect you. Learn how to speak up for yourself.',
    1, true
  ) RETURNING id
),
-- Course 1 Modules
c1_m1 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'Introduction to Disability Rights', 
    'Foundation of disability rights law and self-advocacy basics.',
    'Learn what disability rights are and how to stand up for yourself.',
    1
  FROM course1
  RETURNING id
),
c1_m2 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'Education Rights', 
    'Your rights in school: IEPs, 504 Plans, accommodations, and protections.',
    'Learn about your rights in school.',
    2
  FROM course1
  RETURNING id
),
c1_m3 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'Workplace Rights', 
    'ADA in employment, reasonable accommodations, and workplace protections.',
    'Learn about your rights at work.',
    3
  FROM course1
  RETURNING id
),
c1_m4 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'Housing Rights', 
    'Fair Housing Act, accommodations, modifications, and tenant rights.',
    'Learn about your rights where you live.',
    4
  FROM course1
  RETURNING id
),
c1_m5 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'Public Spaces & Services', 
    'Accessibility in buildings, transportation, voting, and government services.',
    'Learn about your rights in public places.',
    5
  FROM course1
  RETURNING id
),
c1_m6 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'Healthcare & Benefits', 
    'Rights in healthcare settings, insurance, and accessing benefits.',
    'Learn about your rights with doctors and benefits.',
    6
  FROM course1
  RETURNING id
),
c1_m7 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'Advocacy & Enforcement', 
    'How to document, report, and respond to rights violations.',
    'Learn how to report when your rights are violated.',
    7
  FROM course1
  RETURNING id
)
-- Course 1 Module 1 Lessons
INSERT INTO lessons (module_id, title, content, easy_read_content, estimated_time, order_index, xp_reward)
SELECT id, 'What Are Disability Rights?',
'Disability rights are civil rights that protect people with disabilities from discrimination and ensure equal access to opportunities. These rights are protected by federal and state laws.

**Key Laws:**
- **ADA (Americans with Disabilities Act)**: Protects against discrimination in employment, public services, and public accommodations
- **Section 504**: Protects students and employees in federally funded programs
- **IDEA (Individuals with Disabilities Education Act)**: Ensures special education services for K-12 students
- **Fair Housing Act**: Prevents housing discrimination

**What Rights Cover:**
- Equal access to education, employment, housing
- Reasonable accommodations and modifications
- Protection from discrimination and harassment
- Access to public spaces and services

**Character Introduction:**
Meet our characters who will guide you through this journey:
- **Alex**: Uses a wheelchair, college student
- **Sam**: Has ADHD, high school student
- **Taylor**: Uses a cane, working professional
- **Jordan**: Teacher and advocate
- **Riley**: Employee with ADHD
- **Jenny**: Visually impaired student',

'Disability rights are rules that protect people with disabilities. These rules make sure everyone is treated fairly.

**Important Laws:**
- **ADA**: Says people cannot treat you badly because of your disability
- **Section 504**: Protects you in school and work
- **IDEA**: Helps you get special help in school
- **Fair Housing Act**: Says landlords must be fair

**Your Rights Include:**
- Going to school
- Having a job
- Living where you want
- Going to stores and restaurants

**Meet the Characters:**
These people will help you learn:
- **Alex**: Uses a wheelchair
- **Sam**: Has ADHD
- **Taylor**: Uses a cane
- **Jordan**: A teacher
- **Riley**: Works at a job
- **Jenny**: Cannot see well',
15, 1, 10
FROM c1_m1;

-- Continue with more Course 1 Module 1 lessons
WITH c1_m1_id AS (SELECT id FROM c1_m1)
INSERT INTO lessons (module_id, title, content, easy_read_content, estimated_time, order_index, xp_reward)
VALUES
((SELECT id FROM c1_m1_id), 'Understanding Accommodations',
'An accommodation is a change that helps a person with a disability have equal access without changing the fundamental nature of a program or job.

**Types of Accommodations:**

**Education:**
- Extra time on tests
- Note-taking assistance
- Accessible seating
- Audio books or screen readers

**Workplace:**
- Flexible schedules
- Modified equipment
- Quiet workspace
- Remote work options

**Housing:**
- Service animals in no-pet buildings
- Accessible parking spaces
- Modified payment schedules

**Public Spaces:**
- Ramps and elevators
- Accessible restrooms
- Visual and auditory alerts
- Priority seating

**Key Principle:** Accommodations level the playing field. They do not give unfair advantages.

**Scenario:**
Sam has ADHD and struggles to focus during long tests. The school provides extra time as an accommodation. This allows Sam to demonstrate knowledge fairly without changing the test content.',

'An accommodation is a change that helps you do something more easily.

**Examples:**
- More time on a test
- A ramp to enter a building
- A quiet place to work
- Help taking notes

**Where You Can Get Accommodations:**
- At school
- At work
- Where you live
- In stores and restaurants

**Remember:** Accommodations are fair. They help you do what others can do.

**Story:**
Sam has trouble focusing for a long time. The teacher gives Sam more time on tests. Now Sam can show what Sam knows.',
15, 2, 10);

-- Add remaining Module 1 lessons
WITH c1_m1_id AS (SELECT id FROM modules WHERE title = 'Introduction to Disability Rights' LIMIT 1)
INSERT INTO lessons (module_id, title, content, easy_read_content, estimated_time, order_index, xp_reward)
SELECT id, 'Self-Advocacy Basics',
'Self-advocacy means speaking up for yourself and asking for what you need. It is a critical skill for exercising your rights.

**Core Self-Advocacy Skills:**
1. **Know your rights** - Understand what laws protect you
2. **Know yourself** - Understand your disability and needs
3. **Communicate clearly** - Express needs and solutions
4. **Document everything** - Keep records of requests and responses
5. **Follow through** - Ensure accommodations are implemented

**Communication Formula:**
"I have [disability/need] which makes it difficult to [specific task]. I am requesting [specific accommodation] so that I can [achieve goal]."

**Example:**
"I have ADHD which makes it difficult to focus in noisy environments. I am requesting a quiet workspace or noise-canceling headphones so that I can complete my work effectively."',

'Self-advocacy means asking for what you need.

**How To Advocate For Yourself:**
1. Know your rights
2. Know what helps you
3. Tell people clearly what you need
4. Keep copies of what you ask for
5. Make sure you get the help

**How To Ask:**
Say: "I have [your disability]. It is hard for me to [what is hard]. I need [what would help]. This will help me [what you want to do]."

**Example:**
Sam says: "I have ADHD. It is hard to focus when it is noisy. I need a quiet place to work. This will help me finish my work."',
12, 3, 10
FROM c1_m1_id;

-- Course 2: School & Teen Life Rights
WITH course2 AS (
  INSERT INTO courses (title, description, easy_read_description, order_index, is_published) 
  VALUES (
    'School & Teen Life Rights', 
    'Navigate social participation, bullying, online learning, transition planning, and self-advocacy as a teen with a disability.',
    'Learn about your rights as a teen in school and social activities.',
    2, true
  ) RETURNING id
),
c2_m1 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'School Life Beyond Classrooms', 
    'Social participation, clubs, bullying, school events, and online learning.',
    'Learn about joining clubs and staying safe at school.',
    1
  FROM course2
  RETURNING id
)
INSERT INTO lessons (module_id, title, content, easy_read_content, estimated_time, order_index, xp_reward)
SELECT id, 'Social Participation & Clubs',
'Students with disabilities have the right to participate in extracurricular activities under Section 504 and the ADA.

**Your Rights Include:**
- Joining clubs, sports, and activities
- Receiving accommodations for participation
- Accessing school events and field trips
- Equal treatment in social settings

**Examples of Accommodations:**
- **Drama club**: Scripts in braille or large print
- **Science club**: Accessible lab stations
- **Debate team**: Extra processing time
- **Sports**: Adaptive equipment or modified rules',

'You have the right to join clubs and sports at school.

**What This Means:**
- You can join any club
- The school must help you participate
- You can go on field trips
- You should be treated fairly',
15, 1, 10
FROM c2_m1;

-- Course 3: Work & Adult Life Rights
WITH course3 AS (
  INSERT INTO courses (title, description, easy_read_description, order_index, is_published) 
  VALUES (
    'Work & Adult Life Rights', 
    'Understand employment rights, workplace accommodations, benefits navigation, and independent living as an adult with a disability.',
    'Learn about your rights as an adult at work and in life.',
    3, true
  ) RETURNING id
),
c3_m1 AS (
  INSERT INTO modules (course_id, title, description, easy_read_description, order_index)
  SELECT id, 'Entering the Adult World', 
    'How disability rights change after high school and first job rights.',
    'Learn how things change when you become an adult.',
    1
  FROM course3
  RETURNING id
)
INSERT INTO lessons (module_id, title, content, easy_read_content, estimated_time, order_index, xp_reward)
SELECT id, 'How Disability Rights Apply After High School',
'After high school, disability rights shift from school-based protections (IDEA) to adult civil rights laws (ADA, Section 504).

**What Changes:**
- Schools no longer find services for you - you must request them
- No automatic IEP meetings - you schedule accommodations
- Parent involvement becomes your choice
- You control disclosure of your disability

**New Responsibilities:**
- **Self-identification**: You tell employers, schools, landlords about your disability
- **Documentation**: You provide proof of disability when requesting accommodations
- **Self-advocacy**: You negotiate and follow up on accommodations',

'After high school, you are in charge of asking for help.

**What Is Different:**
- No one will find services for you
- You have to ask for what you need
- You decide who knows about your disability
- You are in charge of your choices',
15, 1, 10
FROM c3_m1;
