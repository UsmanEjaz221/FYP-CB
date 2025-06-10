import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import EmojiPicker from "emoji-picker-react";


const CreatePost = () => {
   const textareaRef = useRef(null);
   const categoryRef = useRef(null);
   const [text, setText] = useState("");
   const [img, setImg] = useState(null);
   const [category, setCategory] = useState("Department");
   const [isAnonymous, setIsAnonymous] = useState(false);
   const imgRef = useRef(null);
   const { data: authUser } = useQuery({ queryKey: ["authUser"] });
   const queryClient = useQueryClient();
   const emojiRef = useRef(null);

   const [showPicker, setShowPicker] = useState(false);


   const {
      mutate: createPost,
      isPending,
      isError,
      error,
   } = useMutation({
      mutationFn: async ({ text, img, category }) => {
         try {
            const formData = new FormData();
            formData.append("text", text);
            if (img) {
               formData.append("image", img);
            }
            formData.append("category", category);
            formData.append("isAnonymous", isAnonymous);
            const res = await fetch("/api/posts/create", {
               method: "POST",
               body: formData,
            });

            let data;
            try {
               data = await res.json();
            } catch (e) {
               // const text = await res.text();
               console.error("Non-JSON error:", text);
               throw new Error("Server returned non-JSON response");
            }

            if (!res.ok) {
               throw new Error(
                  data.error || "Something went wrong in createPost"
               );
            }
            return data;
         } catch (error) {
            throw new Error(error);
         }
      },
      onSuccess: () => {
         console.log(data)
         setText("");
         setImg(null);
         toast.success("Post created !");
         queryClient.invalidateQueries({ queryKey: ["posts"] });

         if (data.sentiment === "NEGATIVE") {
            alert("Your post seems to have a negative sentiment. Please reconsider the tone.");
         } else {
            toast.success("Post created!");
         }
      },
   });

   // const isPending = false;
   // const isError = false;
   const onEmojiClick = (emojiData) => {
      setText(prev => prev + emojiData.emoji); // ✅ Correct
      textareaRef.current.focus(); // optional: focus back on textarea
   };


   const data = {
      profileImg: "/avatars/boy1.png",
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      // alert("Post created successfully");
      createPost({ text, img, category });
   };

   const addAnimation = () => {
      const textarea = textareaRef.current;
      const categoryDiv = categoryRef.current;

      if (textarea) {
         textarea.style.transition = "height 0.2s ease";
         textarea.style.height = "auto";
         textarea.style.height = `${textarea.scrollHeight}px`;
      }

      if (categoryDiv && categoryDiv.classList.contains("hidden")) {
         categoryDiv.classList.remove("hidden");

         // Optional: Force reflow to restart animation
         void categoryDiv.offsetWidth;

         categoryDiv.classList.add("animate__animated", "animate__fadeInDown");

         categoryDiv.addEventListener(
            "animationend",
            () => {
               categoryDiv.classList.remove("animate__animated", "animate__fadeInDown");
            },
            { once: true }
         );
      }
   };

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (
            textareaRef.current &&
            categoryRef.current &&
            !textareaRef.current.contains(event.target) &&
            !categoryRef.current.contains(event.target)
         ) {
            const categoryDiv = categoryRef.current;
            categoryDiv.classList.remove("animate__fadeInDown");
            categoryDiv.classList.add("animate__animated", "animate__fadeOutUp");

            categoryDiv.addEventListener(
               "animationend",
               () => {
                  categoryDiv.classList.add("hidden");
                  categoryDiv.classList.remove("animate__animated", "animate__fadeOutUp");
               },
               { once: true }
            );
         }
         if (
            emojiRef.current &&
            !emojiRef.current.contains(event.target) &&
            !event.target.closest(".emoji-trigger")
         ) {
            setShowPicker(false);
         }
      };

      document.addEventListener("click", handleClickOutside);
      return () => {
         document.removeEventListener("click", handleClickOutside);
      };
   }, []);


   const handleImgChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setImg(file);
      }
   };

   return (
      <div className="flex p-4 items-start gap-4 border-2 rounded-2xl my-4 border-gray-300 bg-[#fff]">
         <div className="avatar">
            <div className="w-8 rounded-full">
               <img src={data.profileImg || "/avatar-placeholder.png"} />
            </div>
         </div>
         <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
            <textarea
               className="textarea bg-[#ecf1fc] rounded-2xl w-full p-3 text-lg text-black resize-none focus:outline-none border-gray-400"
               placeholder="What is happening?!"
               value={text}
               ref={textareaRef}
               onClick={addAnimation}
               onChange={(e) => setText(e.target.value)}
            />
            {/* name of each tab group should be unique */}
            <div ref={categoryRef} role="alert" className="alert bg-transparent text-gray-600 border-gray-300 flex flex-col gap-2 items-start hidden">
               <div className=" flex justify-start gap-2">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     className="stroke-info h-6 w-6 shrink-0"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                     ></path>
                  </svg>
                  <span>Select Category for your post</span>
               </div>

               <div

                  className="customAnimation tabs tabs-box flex justify-evenly bg-[#ffffff] text-black ">
                  <input
                     type="radio"
                     name="category"
                     className="tab [--tab-bg:#ecf1fc] checked:text-black text-black"
                     aria-label="Department"
                     defaultChecked
                  />
                  <input
                     type="radio"
                     name="category"
                     className="tab [--tab-bg:#ecf1fc] checked:text-black text-black"
                     aria-label="Announcement"
                     onChange={() => setCategory("Announcement")}
                  />
                  <input
                     type="radio"
                     name="category"
                     className="tab [--tab-bg:#ecf1fc] checked:text-black"
                     aria-label="Events"
                     onChange={() => setCategory("Events")}
                  />
                  <input
                     type="radio"
                     name="category"
                     className="tab [--tab-bg:#ecf1fc] checked:text-black"
                     aria-label="Other"
                     onChange={() => setCategory("Other")}
                  />
               </div>
               <span className="text-gray-500 flex gap-3 items-center">Post anonymously
                  <input type="checkbox" checked={isAnonymous} className="toggle bg-black checked:bg-[#1a8cd8] " onChange={() => setIsAnonymous(!isAnonymous)} />
               </span>
            </div>

            {img && (
               <div className="relative w-72 mx-auto">
                  <IoCloseSharp
                     className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                     onClick={() => {
                        setImg(null);
                        imgRef.current.value = null;
                     }}
                  />
                  <img
                     src={URL.createObjectURL(img)}
                     className="w-full mx-auto h-72 object-contain rounded"
                  />
               </div>
            )}

            <div className="flex justify-between border-t py-2 border-[#dce1e7]">
               <div className="flex gap-1 items-center">
                  <CiImageOn
                     className="fill-[#153a54] w-6 h-6 cursor-pointer"
                     onClick={() => imgRef.current.click()}
                  />
                  <div className="relative">

                     <BsEmojiSmileFill
                        className="fill-[#153a54] w-5 h-5 cursor-pointer emoji-trigger"
                        onClick={() => setShowPicker(val => !val)}
                     />
                     {showPicker && (
                        <div ref={emojiRef} className="absolute top-full mt-2 z-50">
                           <EmojiPicker onEmojiClick={onEmojiClick} />
                        </div>
                     )}         </div>
               </div>
               <div className=" flex gap-2 items-center">
                  <input
                     type="file"
                     accept="image/*"
                     hidden
                     ref={imgRef}
                     onChange={handleImgChange}
                  />

                  <button className="btn  bg-[#1d9bf0] text-white rounded-full btn-sm hover:bg-[#1a8cd8] px-4">
                     {isPending ? "Posting..." : "Post"}
                  </button>
               </div>
            </div>
            {isError && <div className="text-red-500">{error.message}</div>}
         </form>


      </div>
   );
};
export default CreatePost;
