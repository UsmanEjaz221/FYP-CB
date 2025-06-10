import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModel";

import { POSTS } from "../../utils/db/dummy";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";

import useFollow from "../../hooks/useFollow"
import LoadingRing from "../../components/common/LoadingRing";
import toast from "react-hot-toast";
import { anonymous } from "../../utils/anonymous";

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	const {id} = useParams();
	
	const queryClient = useQueryClient();
	const {follow, isPending} = useFollow();
	const {data:authUser} = useQuery({queryKey: ["authUser"]});

	const {data:user, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ["userProfile"],
		queryFn: async () => {
			try {
				const res = await fetch(`/api/user/profile/${id}`)
				const data = await res.json();

				if(!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} catch (error) {
				throw new Error(error)
			}
		}
	});

	const {mutate:updateProfile, isPending:isUpdatingProfile} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/user/updateProfile`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						coverImg,
						profileImg
					}),
				})

				const data = await res.json();

				if(!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Profile updated");
			Promise.all([
				queryClient.invalidateQueries({queryKey: ["authUser"]}),
				queryClient.invalidateQueries({queryKey: ["userProfile"]}), 
			])
		},
		onError: (error) => {
			toast.error(error.message);
		},
	})

	const isMyProfile = authUser._id === user?._id;
	const memberSinceDate = formatMemberSinceDate(user?.createdAt);
	const amIFollowing = authUser?.following.includes(user?._id);

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "coverImg" && setCoverImg(reader.result);
				state === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		refetch();
	}, [user?.id, refetch])

	return (
		<>
			<div className='flex-[4_4_0] rounded-2xl min-h-screen '>
				{/* HEADER */}
				{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
				{!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
				<div className='flex flex-col gap-2'>
					{!isLoading && !isRefetching && user && (
						<>
								<div className='flex gap-10 px-4 py-2 items-center text-black border border-gray-300 rounded-lg bg-white'>
									<Link to='/'>
										<FaArrowLeft className='w-4 h-4 text-[#153a54]' />
									</Link>
									<div className='flex flex-col'>
										<p className='font-bold text-lg'>{user?.fullName}</p>
									</div>
								</div>
							<div className=" flex flex-col bg-white rounded-b-2xl border border-gray-300">
								{/* COVER IMG */}
								<div className='relative group/cover'>
									<img
										src={coverImg || user?.coverImg || "/cover.png"}
										className='h-52 w-full object-cover rounded-lg'
										alt='cover image'
									/>
									{isMyProfile && (
										<div
											className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
											onClick={() => coverImgRef.current.click()}
										>
											<MdEdit className='w-5 h-5 text-white' />
										</div>
									)}

									<input
										type='file'
										hidden
										accept="image/*"
										ref={coverImgRef}
										onChange={(e) => handleImgChange(e, "coverImg")}
									/>
									<input
										type='file'
										hidden
										accept="image/*"
										ref={profileImgRef}
										onChange={(e) => handleImgChange(e, "profileImg")}
									/>
									{/* USER AVATAR */}
									<div className='avatar absolute -bottom-16 left-4'>
										<div className='w-32 rounded-full relative group/avatar'>
											<img src={profileImg || user?.profileImg || "/avatar-placeholder.png"} />
											<div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
												{isMyProfile && (
													<MdEdit
														className='w-4 h-4 text-white'
														onClick={() => profileImgRef.current.click()}
													/>
												)}
											</div>
										</div>
									</div>
								</div>
								<div className='flex justify-end px-4 mt-5'>
									{isMyProfile && <EditProfileModal authUser={authUser} />}
									{!isMyProfile && (
										<button
											className='btn btn-outline rounded-full btn-sm'
											onClick={() => follow(user?._id)}
										>
											{isPending && <LoadingRing />}
											{!isPending && amIFollowing && "Unfollow"}
											{!isPending && !amIFollowing && "Follow"}	
										</button>
									)}
									{(coverImg || profileImg) && (
										<button
											className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
											onClick={() => updateProfile()}
										>
											{isPending? "Updating" : "Update"}
										</button> 
									)}
								</div>

								<div className='flex flex-col gap-4 mt-3 px-4 text-black py-4'>
									<div className='flex flex-col'>
										<span className='font-bold text-lg'>{ user?.fullName}</span>
										<span className='text-sm text-slate-500'>@{user?.university}</span>
										<span className='text-sm my-1'>{user?.bio}</span>
									</div>

									<div className='flex gap-2 flex-wrap'>
										{user?.link && (
											<div className='flex gap-1 items-center '>
												<>
													<FaLink className='w-3 h-3 text-slate-500' />
													<a
														href='https://youtube.com/@asaprogrammer_'
														target='_blank'
														rel='noreferrer'
														className='text-sm text-blue-500 hover:underline'
													>
														youtube.com/@asaprogrammer_
													</a>
												</>
											</div>
										)}
										<div className='flex gap-2 items-center'>
											<IoCalendarOutline className='w-4 h-4 text-slate-500' />
											<span className='text-sm text-slate-500'>
												{memberSinceDate}
											</span>
										</div>
									</div>
									<div className='flex gap-2'>
										<div className='flex gap-1 items-center'>
											<span className='font-bold text-sm'>{user?.following.length}</span>
											<span className='text-slate-500 text-sm'>Following</span>
										</div>
										<div className='flex gap-1 items-center'>
											<span className='font-bold text-sm'>{user?.followers.length}</span>
											<span className='text-slate-500 text-sm'>Followers</span>
										</div>
									</div>
								</div>
							</div>

							<div className='flex w-full border border-gray-300 rounded-full bg-white mt-4'>
								<div
									className='flex justify-center text-[#153a54] flex-1 p-3 transition duration-300 relative cursor-pointer'
									onClick={() => setFeedType("posts")}
								>
									Posts
									{feedType === "posts" && (
										<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
									)}
								</div>
								<div
									className='flex justify-center flex-1 p-3 text-slate-500 transition duration-300 relative cursor-pointer'
									onClick={() => setFeedType("likes")}
								>
									Likes
									{feedType === "likes" && (
										<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary' />
									)}
								</div>
							</div>
						</>
					)}

					<Posts feedType={feedType}  username={user?.username} userId={user?._id} className="profilePost" />
				</div>
			</div>
		</>
	);
};
export default ProfilePage;