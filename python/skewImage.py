#############################################################
# Crafting Computer Vision
# Auto Rotate, Skew, Distort and Extracting Text
# Dolants
#############################################################

# import the necessary packages
from PIL import Image
import numpy as np
import argparse
import cv2
import glob
import sys
import pytesseract
import os
import imutils

# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-i", "--image", required=True,
	help="path to input image file")
ap.add_argument("-p", "--preprocess", type=str, default="thresh",
	help="type of preprocessing to be done")
args = vars(ap.parse_args())

# load the image from disk
image = cv2.imread(args["image"])

# convert the image to grayscale and flip the foreground
# and background to ensure foreground is now "white" and
# the background is "black"
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
gray = cv2.bitwise_not(gray)
 
# threshold the image, setting all foreground pixels to
# 255 and all background pixels to 0
thresh = cv2.threshold(gray, 0, 255,
	cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]


#cv2.imshow('satu',image)
#cv2.waitKey(0)
#cv2.imshow('dua',gray)
#cv2.waitKey(0)
#cv2.imshow('tiga',thresh)
#cv2.waitKey(0)


# grab the (x, y) coordinates of all pixel values that
# are greater than zero, then use these coordinates to
# compute a rotated bounding box that contains all
# coordinates
coords = np.column_stack(np.where(thresh > 0))
angle = cv2.minAreaRect(coords)[-1]
 
# the `cv2.minAreaRect` function returns values in the
# range [-90, 0); as the rectangle rotates clockwise the
# returned angle trends to 0 -- in this special case we
# need to add 90 degrees to the angle
if angle < -45:
	angle = -(90 + angle)
 
# otherwise, just take the inverse of the angle to make
# it positive
else:
	angle = -angle


# rotate the image to deskew it
(h, w) = image.shape[:2]
center = (w // 2, h // 2)
M = cv2.getRotationMatrix2D(center, angle, 1.0)
rotated = cv2.warpAffine(image, M, (w, h),
	flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

cv2.imshow('empat',rotated)
cv2.waitKey(0)

# draw the correction angle on the image so we can validate it
####### NULIS KE DALAM GAMBAR di disabled
########cv2.putText(rotated, "Angle: {:.2f} degrees".format(angle),(10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
 
# show the output image
print("[INFO] angle: {:.3f}".format(angle))
cv2.imshow("Input", image)
cv2.imshow("Rotated", rotated)
cv2.imwrite("rotated.jpg", rotated)
cv2.waitKey(0)


# ################ Find CONTOURS DIABAIKAN DULU
# image, contours, hierarchy = cv2.findContours(rotated, cv2.RETR_EXTERNAL,
#                             cv2.CHAIN_APPROX_SIMPLE)

# color_img = cv2.cvtColor(rotated, cv2.COLOR_GRAY2BGR)



# # draw contours onto image
# img = cv2.drawContours(color_img, contours, -1, (0, 255, 0), 1)
# cv2.imshow("xyz", img)
# cv2.waitKey(0)

############################ END OF THE LONGEST LINE

def auto_canny(image, sigma=0.33):
	# compute the median of the single channel pixel intensities
	v = np.median(image)
 
	# apply automatic Canny edge detection using the computed median
	lower = int(max(0, (1.0 - sigma) * v))
	upper = int(min(255, (1.0 + sigma) * v))
	edged = cv2.Canny(image, lower, upper)
 
	# return the edged image
	return edged



# # construct the argument parse and parse the arguments
# ap = argparse.ArgumentParser()
# ap.add_argument("-i", "--images", required=True,
# 	help="path to input dataset of images")
# args = vars(ap.parse_args())
 
# # loop over the images
# for imagePath in glob.glob(args["images"] + "/*.jpg"):
	# load the image, convert it to grayscale, and blur it slightly
#image = cv2.imread(args["image"])
image = rotated
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

blurred = cv2.GaussianBlur(gray, (3, 3), 0)

# apply Canny edge detection using a wide threshold, tight
# threshold, and automatically determined threshold
wide = cv2.Canny(blurred, 10, 200)
tight = cv2.Canny(blurred, 225, 250)
auto = auto_canny(blurred)

# show the images
cv2.imshow("Original", image)
###cv2.imshow("Edges", np.hstack([wide, tight, auto])) MENGHASILKAN TIGA GAMBAR
cv2.imshow("Edges", auto)
cv2.imwrite("file.jpg",auto)
cv2.waitKey(0)


cv2.imwrite("file.jpg",auto)


# load the image as a PIL/Pillow image, apply OCR, and then delete
# the temporary file
text = pytesseract.image_to_string(gray)
print(text)
 
# show the output images
#cv2.imshow("Image", image)
#cv2.imshow("Output", gray)
#cv2.waitKey(0)


cv2.destroyAllWindows()
